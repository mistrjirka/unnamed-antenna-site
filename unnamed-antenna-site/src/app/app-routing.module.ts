import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SingleComponent } from './single/single.component';
import { AppComponent } from './app.component';
import { AntennaListingComponent } from './antenna-listing/antenna-listing.component';
const routes: Routes = [
  { path: '', component: AntennaListingComponent },
  { path: 'detail', component: SingleComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
