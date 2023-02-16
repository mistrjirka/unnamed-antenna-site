import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IContentAntenna, IFrequencyTable } from '../model/chart';
import { CompareService } from '../services/compare.service';
import { FileloadingService } from '../services/fileloading.service';
import { ListingService } from '../services/listing.service';
import {
  AnalogueFrequencyTable,
  DigFrequencyTable,
} from '../data/frequency-table';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css'],
})
export class CompareComponent implements OnInit {
  ready: boolean = false;
  antennaList: IContentAntenna[] = [];
  results = [];
  optionsList: { id: string; name: string }[] = [];
  selected: { id: string; name: string }[] = [];

  methodsList: { id: number; name: string }[] = [
    { id: 0, name: 'Find common frequencies' },
    { id: 1, name: 'Min data (useful for diversity systems)' },
    { id: 2, name: 'Average data' },
  ];

  methods = [this.files.maxData, this.files.minData, this.files.averageData];
  
  selectedMethod: { id: number; name: string } = this.methodsList[0];

  tablesList: { id: number; name: string }[] = [
    { id: 0, name: 'Analogue systems FPV bands' },
    { id: 1, name: 'Digital systems FPV bands' },
  ];

  tables: IFrequencyTable[][] = [AnalogueFrequencyTable, DigFrequencyTable];
  
  selectedTables: { id: number; name: string }[] = [];

  get isReady(): boolean {
    return this.ready;
  }

  constructor(
    private listing: ListingService,
    public compare: CompareService,
    public files: FileloadingService
  ) {}

  async ngOnInit(): Promise<void> {
    this.antennaList = await this.listing.getAntennas();

    this.antennaList.forEach((antenna) => {
      this.optionsList.push({ id: antenna.id, name: antenna.name });
    });

    this.ready = true;
  }
  
}
