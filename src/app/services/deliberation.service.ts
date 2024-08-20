import { Injectable } from '@angular/core';
import { Contract, Method } from '../contract';
import { CommonService } from './common.service';
import { ProfileService } from './profile.service';
import { concatMap, of, ReplaySubject, tap } from 'rxjs';
import { AgentService } from '../agent.service';
import { ListenService } from './listen.service';

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
  parent: Statement | null;
  kids: Collection;
  ranking_topics: Ranking | null;
}

export interface Deliberation {
  contract: Contract;
  sid: string | null;
  page: Page;
  aggregateOrder: string[][];
  supportIndex: number;
  opposeIndex: number;
  notifier: ReplaySubject<void>;
}

@Injectable({
  providedIn: 'root'
})
export class DeliberationService {

  deliberations: {[key: string]: Deliberation} = {};

  constructor(
    private agentService: AgentService,
    private commonService: CommonService,
    private profileService: ProfileService,
    private listenService: ListenService
  ) { }

  initialize(contracts: Contract[], profile: string) {
    // find deliberations
    for (let contract of contracts) {
      if (contract.contract === DELIB_FILE_NAME) {
        this.commonService.isContractUsesProfile(contract.id, profile).subscribe((reply) => {
          if (reply) {
            this.deliberations[contract.id] = { contract: contract, sid: null, notifier: new ReplaySubject<void>(1) } as Deliberation;
            this.readDeliberation(contract.id, null).subscribe();
            this.listenService.subscribe(contract.id, 'contract_write', (content: any)=>{
              console.log('deliberation listener', content);
              this.readDeliberation(contract.id, this.deliberations[contract.id].sid).subscribe();
            })
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

  readDeliberation(contract: string, sid: string | null) {
    console.log('sid', sid);
    let method = { name: 'get_statements', values: {'parent': sid}} as Method;
    return this.agentService.read(contract, method).pipe(
      tap((page: Page) => {
      this.deliberations[contract].page = page;
      this.setAggregatedOrder(contract);
      this.deliberations[contract].notifier.next();
      console.log('just notified', this.deliberations[contract].notifier)
    }));
  }

  createStatement(contract: string, sid: string | null, statement: string): void {
    const method = { name: 'create_statement',
                     values: {'parent': sid, 'text': statement}} as Method;
    this.agentService.write(contract, method)
      .subscribe();
  }

  setRanking(contract: string, sid: string | null, order: string[][]) {
    const method = { name: 'set_ranking',
                     values: {'sid': sid, 'order': order}} as Method;
    this.agentService.write(contract, method).subscribe();
  }

  deleteStatement(contract: string, sid: string): void {
    const method = { name: 'delete_statement',
                     values: {'sid': sid}} as Method;
    this.agentService.write(contract, method)
      .subscribe();
  }

  setAggregatedOrder(contract: string) {
    let deliberation = this.deliberations[contract]
    let ranking = deliberation.page.parent?.ranking_kids || deliberation.page.ranking_topics;
    if(!ranking || Object.keys(ranking).length == 0) {
      deliberation.aggregateOrder = deliberation.page.kids ? [Object.keys(deliberation.page.kids)] : [[]];
      deliberation.supportIndex = 0;
      deliberation.opposeIndex = 0;
    } else {
      deliberation.aggregateOrder = [];
      let kids = [...Object.keys(deliberation.page.kids), 'support', 'oppose'];
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
      console.log('aggregateOrder', deliberation.aggregateOrder)
      for (let index = 0; index < deliberation.aggregateOrder.length; ++index) {
        let supportInnerIndex = deliberation.aggregateOrder[index].indexOf('support')
        if (supportInnerIndex >= 0) {
          deliberation.supportIndex = index;
          deliberation.aggregateOrder[index].splice(supportInnerIndex, 1)
        }
        let opposeInnerIndex = deliberation.aggregateOrder[index].indexOf('oppose')
        if (opposeInnerIndex >= 0) {
          deliberation.opposeIndex = index;
          deliberation.aggregateOrder[index].splice(opposeInnerIndex, 1)
        }
      }
      console.log('aggregateOrder', deliberation.aggregateOrder)
    }
  }
}
