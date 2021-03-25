import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { DataSummary } from '../models/dataSummary';
import { interval } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})

export class EntitiesService {
    private serverApiUrl = environment.apiUrl;
    private source = interval(5000);
    private pythonServerStatus = 0;
    private fiwareApiStatus = 0;

    constructor(private http: HttpClient){
        this.source.subscribe(() => {
            this.http
                .get(`http://${this.serverApiUrl}/ping`, { observe: 'response' })
                .pipe(first())
                .subscribe(resp => {
                    if (resp.status === 200){
                        this.pythonServerStatus = 1;
                    } else {
                        this.pythonServerStatus = 2;
                    }
                }, err => this.pythonServerStatus = 2);
            this.http
                .get(`http://${this.serverApiUrl}/pingApi`, { observe: 'response' })
                .pipe(first())
                .subscribe(resp => {
                    if (resp.status === 200){
                        if (JSON.parse(JSON.stringify(resp.body)).status === 'Pass'){
                            this.fiwareApiStatus = 1;
                        } else {
                            this.fiwareApiStatus = 2;
                        }
                    } else {
                        this.fiwareApiStatus = 2;
                    }
                }, err => this.fiwareApiStatus = 2);
        });
    }

    public getFirstEntity(entityId: string, service: string): Promise<DataSummary> {
        const url = `http://${this.serverApiUrl}/entitySummary?entityId=${entityId}&service=${service}`;
        const res = this.http
                        .get(url)
                        .toPromise()
                        .catch(this.handleError);
        return res;
    }

    public getServerStatus(): number {
        return this.pythonServerStatus;
    }

    public getFiwareApiStatus(): number {
        return this.fiwareApiStatus;
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error.error.errmsg || error);
        return Promise.reject(error.error.errmsg || error);
    }
}
