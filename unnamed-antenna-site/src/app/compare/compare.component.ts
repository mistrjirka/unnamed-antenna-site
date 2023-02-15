import { Component, OnInit } from '@angular/core';
import { IAntennaList } from '../model/chart';
import { ListingService } from '../services/listing.service';


@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css']
})
export class CompareComponent implements OnInit  {
  
  ready: boolean = false;
  antennaList: IAntennaList[] = [];

  optionsList: {id: string, name: string}[] = [];
  selected: {id: string, name: string}[] = [];

  
  
  get isReady(): boolean { return this.ready; }

  constructor(private listing: ListingService){

  }


  async ngOnInit(): Promise<void> {
    this.antennaList = await this.listing.getAntennas();
    this.antennaList.forEach(antenna=>{
      this.optionsList.push({id: antenna.id, name: antenna.name})
    })
    this.ready = true;
  }
  compare(){

  }
}
