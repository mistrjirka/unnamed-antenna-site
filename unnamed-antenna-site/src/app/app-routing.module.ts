import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SingleComponent } from './single/single.component';
import { AppComponent } from './app.component';
import { AntennaListingComponent } from './antenna-listing/antenna-listing.component';
import { CompareComponent } from './compare/compare.component';

const routes: Routes = [
  { path: 'detail/:id', component: SingleComponent },
  { path: 'compare', component: CompareComponent },
  { path: '', component: AntennaListingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes,  { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
