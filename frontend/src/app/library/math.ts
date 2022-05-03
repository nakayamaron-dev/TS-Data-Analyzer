export class my_math {

    public calcCorrelationCoefficient(x: number[], y: number[]): number {
        const n = Math.min(x.length, y.length);
        const std_x = Math.sqrt(this.calcVariance(x));
        const std_y = Math.sqrt(this.calcVariance(y));
        const avg_x = this.calcAverage(x);
        const avg_y = this.calcAverage(y);
        let covar = 1;
    
        for (let i = 0; i < n; i++) {
          covar += (x[i] - avg_x) * (y[i] - avg_y)
        }
    
        covar /= n;
    
        return Number((covar / (std_x * std_y)).toFixed(2));
    }
    
    public calcSummary(numbers: number[], key: string): string {
        switch(key) {
          case 'count':
            return numbers.length.toFixed();
          case 'mean':
            return this.calcAverage(numbers).toFixed(2);
          case 'std':
            return Math.sqrt(this.calcVariance(numbers)).toFixed(2);
          case 'min':
            return numbers.length > 0 ? Math.min(...numbers).toFixed(2) : '';
          case '25%':
            return this.calcQuartile(numbers, 0.25).toFixed(2);
          case '50%':
            return this.calcQuartile(numbers, 0.5).toFixed(2);
          case '75%':
            return this.calcQuartile(numbers, 0.75).toFixed(2);
          case 'max':
            return numbers.length > 0 ? Math.max(...numbers).toFixed(2) :'';
          default:
            return '';
        }
    }
    
    public calcSum(numbers: number[], initialValue: number = 0): number {
        if (numbers.length === 0) { return NaN }
    
        return numbers.reduce(
          (accumulator: number, currentValue: number) => accumulator + currentValue,
          initialValue
        )
    }
    
    public calcAverage(numbers: number[]): number {
        if (numbers.length === 0) { return NaN }
    
        return this.calcSum(numbers) / numbers.length;
    }
    
    public calcVariance(numbers:number[]): number {
        if (numbers.length === 0) { return NaN }
    
        const average = this.calcAverage(numbers);
        const length = numbers.length;
    
        const squaredDifference = numbers.map((current) => {
          const difference = current - average;
          return difference ** 2;
        });
        
        return squaredDifference.reduce((previous, current) => previous + current) / length;
    }
    
    public calcQuartile(numbers: number[], q: number): number {
        if (numbers.length === 0) { return NaN }
    
        numbers = numbers.sort((a, b) => a - b);
        const pos = ((numbers.length) - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
    
        if( (numbers[base+1] !== undefined) ) {
          return numbers[base] + rest * (numbers[base+1] - numbers[base]);
        } else {
          return numbers[base];
        }
    }
}