import { Estacionamiento } from '../../interfaces/estacionamiento';
import { EstacionamientosService } from '../../services/estacionamientos.service';
import { Reporte } from '../../interfaces/reporte';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent {

  estacionamientos = inject(EstacionamientosService);

  historialEstacionamientos2: Estacionamiento[] = [];
  reporteEstacionamientos2: Reporte[] = [];

  ngOnInit() {
    this.reloadReporte();
    console.log("Reportes después de borrar junio y julio:", this.reporteEstacionamientos2);
  }

  reloadReporte() {
    this.estacionamientos.cargar().then(estacionadas => {
      for (let estacionada of estacionadas) {
        if (estacionada.horaEgreso != null) {
          this.historialEstacionamientos2.push(estacionada);
        }
      }

      this.historialEstacionamientos2.sort((a, b) => {
        if (a.horaIngreso > b.horaIngreso) {
          return 1;
        }
        if (a.horaIngreso < b.horaIngreso) {
          return -1;
        }
        return 0;
      });

      let mesesTrabajo: string[] = [];
      let meses = ["Enero", 
        "Febrero", 
        "Marzo", 
        "Abril", 
        "Mayo", 
        "Junio", 
        "Julio", 
        "Agosto", 
        "Septiembre", 
        "Octubre", 
        "Noviembre", 
        "Diciembre"
      ]

      for (let estacionada of this.historialEstacionamientos2) {
        const estacionadaConDate = { ...estacionada, horaIngreso: new Date(estacionada.horaIngreso) };
        const periodo = meses[estacionadaConDate.horaIngreso.getMonth()] + " " + estacionadaConDate.horaIngreso.getFullYear();
        if (!mesesTrabajo.includes(periodo)) {
          mesesTrabajo.push(periodo);
          this.reporteEstacionamientos2.push({
            nro: this.reporteEstacionamientos2.length + 1,
            mes: periodo,
            usos: 1,
            cobrado: estacionada.costo ?? 0
          });
        } else {
          const reporte = this.reporteEstacionamientos2.find(r => r.mes === periodo)!;
          reporte.usos++;
          reporte.cobrado += estacionada.costo ?? 0;
        }
      }

    })
  }

  
}
