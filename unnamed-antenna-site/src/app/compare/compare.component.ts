import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IContentAntenna } from '../model/chart';
import { CompareService } from '../services/compare.service';
import { FileloadingService } from '../services/fileloading.service';
import { ListingService } from '../services/listing.service';


@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css']
})
export class CompareComponent implements OnInit  {
  
  ready: boolean = false;
  antennaList: IContentAntenna[] = [];

  optionsList: {id: string, name: string}[] = [];
  selected: {id: string, name: string}[] = [];

  
  
  get isReady(): boolean { return this.ready; }

  constructor(private listing: ListingService, public compare: CompareService, public files: FileloadingService){}


  async ngOnInit(): Promise<void> {
    this.antennaList = await this.listing.getAntennas();

    this.antennaList.forEach(antenna=>{
      this.optionsList.push({id: antenna.id, name: antenna.name});
    });

    this.ready = true;
  }

  
}
