export interface IGraphData {
    labels: string[];
    datasets: {label: string, data: string[], backgroundColor: string}[];
}

export interface IFrequencyData {
    frequency: number;
    real: number;
    imag: number;
    swr: number;
}

export interface IFrequencyTable {
    name: string;
    center: number;
    bandwidth: number;
}

export interface IFrequencyRange {
    center: number;
    bandwidth: number;
    averageSwr: number;
    channels: IFrequencyTable[];
}

export interface IContentCategory{
    name: string;
    id: string;
}

export interface IAntennaList{
    name: string;
    id: string;
}

export interface IContentAntenna{
    id:string;
    name: string;
    units: string;
    unitDivider: number;
    startFrequency: number;
    endFrequency: number;
    description:string;
    dataFile: string;
    image: string;
    tables: ("digital" | "analogue" | "uhf" | "vhf")[]
}
export interface IContentFile {
    categories: IContentCategory[];
    content: {
        [idCat: string]:  IContentAntenna[];
        
    }
}

export interface ICompatibleAntenna {
    antenna: IContentAntenna;
    bands: IFrequencyRange[];
}