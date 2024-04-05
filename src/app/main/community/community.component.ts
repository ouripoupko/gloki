import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrl: './community.component.scss'
})
export class CommunityComponent implements OnInit {
  communityId: string | null = null;
  community = {name: "", id: ""};
  shareMode: boolean = false;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.communityId = params.get('communityId');
      this.community.id = this.communityId || "";
      this.community.name = "name";
      // Use the communityId to fetch the specific community data
      // from a service or perform any other necessary actions
    });
  }

  toggleShareMode(): void {
    this.shareMode = !this.shareMode;
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }

}
