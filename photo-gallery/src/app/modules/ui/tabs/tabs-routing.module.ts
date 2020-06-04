import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'application',
    component: TabsPage,
    children: [
      {
        path: 'main-page',
        loadChildren: () => import('@modules/gallery/pages/main/main.module')
          .then(m => m.MainModule)
      },
      {
        path: '',
        redirectTo: '/application/main-page',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/application/main-page',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
