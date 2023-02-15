import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IContentAntenna, IContentFile, IAntennaList } from '../model/chart';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ListingService {
  private readonly content_root: string = '/assets/content/';
  private fileContent: IContentFile | null = null;
  constructor(private http: HttpClient) {}

  async getContent(
    fname: string = 'main.json',
    forceLoad: boolean = false
  ): Promise<IContentFile> {
    if (this.fileContent != null && !forceLoad) {
      return this.fileContent;
    }
    const result$ = this.http.get<IContentFile>(
      `${this.content_root}/${fname}`,
      {
        responseType: 'json',
      }
    );
    const rawData: IContentFile = await lastValueFrom(result$);
    this.fileContent = rawData;
    return rawData;
  }

  getAntennasFromCategory(
    data: IContentFile,
    category: string
  ): IContentAntenna[] {
    let categoryExists =
      data.categories.find((c) => c.id === category) != undefined;

    if (categoryExists) return data.content[category];

    let toReturn: IContentAntenna[] = [];

    data.categories.forEach(
      (c) => (toReturn = toReturn.concat(data.content[c.id]))
    );

    return toReturn;
  }

  async getAntennaById(
    id: string,
    data: IContentFile | null = null
  ): Promise<IContentAntenna | null> {
    let loadedData: IContentFile = {} as IContentFile;
    if (data == null) {
      if (this.fileContent == null) {
        await this.getContent();
      }
      if (this.fileContent != null) {
        loadedData = this.fileContent;
      }
    }
    if (data != null) loadedData = data;
    if (loadedData == null) return null;

    let antenna: IContentAntenna | null = null;
    loadedData.categories.every((category) => {
      loadedData.content[category.id].every((ant) => {
        if (ant.id == id) {
          antenna = ant;
          return false;
        }
        return true;
      });
      return antenna == null;
    });

    return antenna;
  }

  async getAntennas(
    data: IContentFile | null = null
  ): Promise<IContentAntenna[]> {
    let list: IContentAntenna[] = [];
    let loadedData: IContentFile = {} as IContentFile;
    if (data == null) {
      if (this.fileContent == null) {
        await this.getContent();
      }
      if (this.fileContent != null) {
        loadedData = this.fileContent;
      }
    }

    if (data != null) loadedData = data;
    loadedData.categories.every((category) => {
      loadedData.content[category.id].every((ant) => {
        list.push(ant)
        return true;
      });
      return true;
    });
    
    return list;
  }
}
