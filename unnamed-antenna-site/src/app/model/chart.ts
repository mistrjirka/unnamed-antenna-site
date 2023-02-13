export interface IGraphData {
    labels: string[];
    datasets: {label: string, data: string[], backgroundColor: string}[];
}

export interface IFrequencyData {
    frequency: number;
    real: number;
    imag: number;
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
