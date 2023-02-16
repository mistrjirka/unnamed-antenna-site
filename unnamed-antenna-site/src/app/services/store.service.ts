import { Injectable } from '@angular/core';
import { IAntennaList, IContentAntenna, IFrequencyData } from '../model/chart';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private frequencyData: IFrequencyData[] = [];
  private antennaList: IAntennaList[] = [];
  private antenna: IContentAntenna = {} as IContentAntenna; 

  constructor() {
  }
  
  storeFrequencyData(data: IFrequencyData[]): void {
    this.frequencyData = data;
  }

  getFrequencyData(): IFrequencyData[] {
    return this.frequencyData;
  }
  
  storeAntennaList(data: IAntennaList[]): void {
    this.antennaList = data;
  }
  
  getAntennaList(): IAntennaList[] {
    return this.antennaList;
  }

  storeAntenna(data: IContentAntenna ): void {
    this.antenna = data;
  }

  getAntenna(): IContentAntenna {
    return this.antenna;
  }

}
