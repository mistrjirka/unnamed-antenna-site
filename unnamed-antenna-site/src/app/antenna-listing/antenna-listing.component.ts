import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { IContentAntenna, IContentFile } from '../model/chart';
import { ListingService } from '../services/listing.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-antenna-listing',
  templateUrl: './antenna-listing.component.html',
  styleUrls: ['./antenna-listing.component.css'],
})
export class AntennaListingComponent implements OnInit {
  public category: string = '';
  public antennas: IContentAntenna[] = [];
  public content: IContentFile = {} as IContentFile;
  public ready: boolean = false;

  constructor(private route: ActivatedRoute, private listing: ListingService) {}

  get isReady(): boolean {
    return this.isReady;
  }

  async ngOnInit(): Promise<void> {
    console.log('hello there');
    this.content = await this.listing.getContent();
    this.route.queryParams.subscribe((params) => {
      this.category = params['category'];
      console.log(this.content);
      this.antennas = this.listing.getAntennasFromCategory(
        this.content,
        this.category
      );
      console.log(this.antennas);
      this.ready = true;
    });
  }
}
