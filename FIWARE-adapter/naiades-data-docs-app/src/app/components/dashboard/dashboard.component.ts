import { Component, OnInit } from '@angular/core';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';

import { Entity } from 'src/app/models/entity';
import { entities } from '../../models/entities';
import { DataSummary } from 'src/app/models/dataSummary';
import { EntitiesService } from '../../services/entities.service';

interface Source {
    name: string;
    status: number;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    timer: any;
    interval: any;
    fiwareApi: Source;
    pythonServer: Source;
    entities: Entity[] = [];
    dataSummary: DataSummary;

    constructor(private entitiesService: EntitiesService) {
        this.dataSummary = {
            http_status: -1,
            first_date: '',
            sample_count: -1,
            last_date: '',
            sample_json: ''
        };

        this.fiwareApi = {
            name: 'Fiware API',
            status: 0
        };

        this.pythonServer = {
            name: 'Python server',
            status: 0
        };
    }

    private async getDataSummary(entity: Entity): Promise<void> {
        await this.entitiesService
                    .getFirstEntity(entity.entityId, entity.service)
                    .then((data) => {
                        this.dataSummary = data;
                        this.dataSummary.sample_json = JSON.stringify(this.dataSummary.sample_json);
                        console.log(data);
                        this.timer = setInterval(() => {
                            if (document.getElementById('jsonString') != null) {
                                this.syntaxHighlight(JSON.stringify(JSON.parse(data.sample_json), undefined, 4));
                            }
                        },  100);
                    });
    }

    private syntaxHighlight(json: string): void {
        clearInterval(this.timer);
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const element = document.getElementById('jsonString');
        if (element){
            element.innerHTML = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
                (match: string) => {
                    let color = 'darkorange';
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            color = 'green';
                        } else {
                            color = 'blue';
                        }
                    } else if (/true|false/.test(match)) {
                        color = 'red';
                    } else if (/null/.test(match)) {
                        color = 'magenta';
                    }
                    return '<span style=\"color: ' + color + ';\">' + match + '</span>';
                }
            );
        }
    }
    public onOptionsSelected(selectedEntity: Entity): void {
        if (selectedEntity !== undefined && this.fiwareApi.status && this.pythonServer.status){
            this.getDataSummary(selectedEntity);
        }
    }

    ngOnInit(): void {
        this.entities = entities;
        this.fiwareApi.status = this.entitiesService.getFiwareApiStatus();
        this.pythonServer.status = this.entitiesService.getServerStatus();
        this.interval = setInterval(() => {
            this.fiwareApi.status = this.entitiesService.getFiwareApiStatus();
            this.pythonServer.status = this.entitiesService.getServerStatus();
        }, 10000);
    }
}
