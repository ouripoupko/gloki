import { Injectable } from '@angular/core';
import { Contract, Method } from '../contract';
import { CommonService } from './common.service';
import { ProfileService } from './profile.service';
import { concatMap, of } from 'rxjs';
import { AgentService } from '../agent.service';

const DELIB_FILE_NAME = 'gloki_delib.py';

export interface Ranking {
  [sid: string]: string[][];
}

export interface Statement {
  parent: string;
  kids: string[];
  owner: string;
  text: string;
  ranking_kids: Ranking;
  counter: number;
}

export interface Collection {
  [sid: string]: Statement;
}

export interface Page {
  parent: Collection;
  kids: Collection;
}

export interface Deliberation {
  contract: Contract;
  sid:string | null;
  parent:Statement | null;
  kids:Collection;
  aggregateOrder:string[][];
}

@Injectable({
  providedIn: 'root'
})
export class DeliberationService {

  deliberations: {[key: string]: Deliberation} = {};

  constructor(
    private agentService: AgentService,
    private commonService: CommonService,
    private profileService: ProfileService
  ) { }

  initialize(contracts: Contract[], profile: string) {
    // find deliberations
    for (let contract of contracts) {
      if (contract.contract === DELIB_FILE_NAME) {
        this.commonService.isContractUsesProfile(contract.id, profile).subscribe((reply) => {
          if (reply) {
            this.deliberations[contract.id] = { contract: contract, sid: null } as Deliberation;
            this.readDeliberation(contract.id);
          }
        });
      }
    }
  }

  deployDelib(name: string, community: string) {
    console.log('deploy deliberation', name, community);
    if (!this.profileService.contract) return of();
    return this.commonService.deployContract(name, DELIB_FILE_NAME, this.profileService.contract, {community: community}).pipe(
      concatMap(contract => {
        let method = {} as Method;
        method.name = 'set_property';
        method.values = {'key': 'deliberation', 'value': contract};
        return this.agentService.write(community, method);
      })  
    );
  }

  readDeliberation(contract: string) {
    let sid = this.deliberations[contract].sid;
    console.log('sid', sid);
    let method = { name: 'get_statements', values: {'parent': sid}} as Method;
    this.agentService.read(contract, method).subscribe((page: Page) => {
      if(page.parent && sid && sid in page.parent) {
        this.deliberations[contract].parent = page.parent[sid];
      }
      else {
        this.deliberations[contract].parent = null;
      }
      this.deliberations[contract].kids = page.kids;
      this.setAggregatedOrder(contract);
    });
  }

  createStatement(contract: string, statement: string): void {
    const method = { name: 'create_statement',
                     values: {'parent': this.deliberations[contract].sid, 'text': statement}} as Method;
    this.agentService.write(contract, method)
      .subscribe();
  }

  setRanking(contract: string, sid: string, order: string[][]) {
    const method = { name: 'set_ranking',
                     values: {'sid': sid, 'order': order}} as Method;
    this.agentService.write(contract, method).subscribe();
  }

  deleteStatement(contract: string): void {
    const method = { name: 'delete_statement',
                     values: {'sid': this.deliberations[contract].sid}} as Method;
    this.agentService.write(contract, method)
      .subscribe();
  }

  setAggregatedOrder(contract: string) {
    let deliberation = this.deliberations[contract]
    if(!deliberation.parent || Object.keys(deliberation.parent.ranking_kids).length == 0) {
      deliberation.aggregateOrder = deliberation.kids ? [Object.keys(deliberation.kids)] : [[]];
    } else {
      deliberation.aggregateOrder = [];
      let ranking = deliberation.parent.ranking_kids;
      let kids = [...deliberation.parent.kids, 'support', 'oppose'];
      let n = kids.length;
      let indexes: {[keys: string]: number} = {};
      let sum_matrix: number[][] = [];
      kids.forEach((value, index) => {
        indexes[value] = index;
        sum_matrix.push(new Array(n).fill(0));
      });

      // pairwise compare matrix
      for (let order of Object.values(ranking)) {
        let unordered = new Set(Object.keys(indexes));
        for (let above of order[0]) {
          if (unordered.has(above)) {
            unordered.delete(above);
            let above_index = indexes[above];
            for (let below of unordered) {
              let below_index = indexes[below];
              sum_matrix[above_index][below_index] += 1;
            }
          }
        }
        let above = 'support';
        unordered.delete(above);
        let above_index = indexes[above];
        for (let below of unordered) {
          let below_index = indexes[below];
          sum_matrix[above_index][below_index] += 1;
        }
        for (let below of order[1].slice().reverse()) {
          if (unordered.has(below)) {
            unordered.delete(below);
            let below_index = indexes[below];
            for (let above of unordered) {
              let above_index = indexes[above];
              sum_matrix[above_index][below_index] += 1;
            }
          }
        }
        let below = 'oppose';
        unordered.delete(below);
        let below_index = indexes[below];
        for (let above of unordered) {
          let above_index = indexes[above];
          sum_matrix[above_index][below_index] += 1;
        }
      }

      // copeland score
      let copeland: number[] = [];
      for (let row = 0; row < n; ++row) {
        for (let col = row+1; col < n; ++col) {
          sum_matrix[row][col] = (sum_matrix[row][col] > sum_matrix[col][row]) ? 2 :
                                  ((sum_matrix[row][col] == sum_matrix[col][row]) ? 1 : 0);
          sum_matrix[col][row] = 2-sum_matrix[row][col];
        }
        copeland.push(sum_matrix[row].reduce((a,b) => a+b));
      }
      let order = Array.from(Array(n).keys());
      order.sort((a,b) => copeland[b]-copeland[a]);

      // smith sets
      let smith_sets = [];
      let row,col,lhs,rhs,prev: number;
      // loop on all sets
      for(rhs=1,lhs=0,prev=0;lhs<n;rhs=lhs+1) {
        // loop on a single set
        for(;lhs<rhs;lhs=rhs,rhs=row+1) {
          // include candidates with the same copeland score
          for(;rhs<n&&copeland[order[rhs]]==copeland[order[rhs-1]];rhs++);
          // loop on rows and cols to find all zeros
          for(col=rhs,row=n;col==rhs&&row>=rhs;row--) {
            for(col=lhs;col<rhs&&sum_matrix[order[row-1]][order[col]]==0;col++);
          }
        }
        smith_sets.push(Array.from({length: (lhs - prev)}, (v, k) => kids[order[k + prev]]));
        prev = lhs;
      }

      deliberation.aggregateOrder = smith_sets;
    }
  }
}
