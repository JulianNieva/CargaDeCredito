import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastController } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';
import { QrscannerService } from 'src/app/services/qrscanner.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  user: any = null;
  userAuth: any = this.angularFireAuth.authState;
  pressedButton: boolean = false;
  currentScan: any;
  credit: number = 0;
  qr10: string = '8c95def646b6127282ed50454b73240300dccabc';
  qr50: string = 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172';
  qr100: string = '2786f4877b9091dcad7f35751bfcf5d5ea712b2f';

  scanActive: boolean = false;

  constructor(
    private toast:ToastController,
    private userService: UserService,
    private qrScanner: QrscannerService,
    private angularFirestore: AngularFirestore,
    private angularFireAuth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    StatusBar.hide()
    this.pressedButton = true;
    this.userService.user$.subscribe((user: any) => {
      if (user) {
        this.pressedButton = false;
        this.user = user;
        this.credit = this.user.userCredit;
        //this.qrScanner.scanPrepare();
        this.userAuth = this.angularFireAuth.authState.subscribe((user) => {
          this.userAuth = user;
        });
      }
    });
  } // end of ngOnInit

  logoutUser() {
    this.userService.logout();
    setTimeout(() => {
      this.credit = 0;
    }, 2000);
  } // end of logoutUser

  restartCredit() {
    this.pressedButton = true;
    setTimeout(() => {
      this.user.userCredit = 0;
      this.credit = this.user.userCredit;
      this.user.userQrCredit = [];
      this.updateUser();
      this.pressedButton = false;
      this.MostrarToast('El saldo fue eliminado', 'success');
    }, 2000);
  } // end of restartCredit

  startScan() {
    this.pressedButton = true;
    setTimeout(() => {
      this.pressedButton = false;
      this.scanActive = true;
      this.qrScanner.startScan().then((result) => {
        this.currentScan = result?.trim();
        this.scanActive = false;
        this.checkCreditCharge(this.currentScan);
      });
    }, 2000);
  } // end of startScan

  stopScan() {
    this.pressedButton = true;
    setTimeout(() => {
      this.pressedButton = false;
      this.scanActive = false;
      this.qrScanner.stopScanner();
    }, 2000);
  } // end of stopScan

  updateUser() {
    this.angularFirestore
      .doc<any>(`usuarios/${this.userAuth.uid}`)
      .update({
        userCredit: this.user.userCredit,
        correo: this.user.correo,
        id: this.user.id,
        perfil: this.user.perfil,
        userQrCredit: this.user.userQrCredit,
        sexo: this.user.sexo,
      })
      .then(() => {})
      .catch((error) => {});
  } // end of updateUser

  checkCreditCharge(qrCode: string) {
    if (this.user.perfil == 'admin') {
      if (this.checkUserQrCode(qrCode) < 2) {
        if (qrCode === this.qr10) {
          this.user.userCredit += 10;
          this.credit = this.user.userCredit;
          this.user.userQrCredit.push(qrCode);
          this.updateUser();
          this.MostrarToast('Cargaste $10 con éxito', 'success');
        } else if (qrCode === this.qr50) {
          this.user.userCredit += 50;
          this.credit = this.user.userCredit;
          this.user.userQrCredit.push(qrCode);
          this.updateUser();
          this.MostrarToast('Cargaste $50 con éxito', 'success');
        } else if (qrCode === this.qr100) {
          this.user.userCredit += 100;
          this.credit = this.user.userCredit;
          this.user.userQrCredit.push(qrCode);
          this.updateUser();
          this.MostrarToast('Cargaste $100 con éxito', 'success');
        }
      } else {
        this.MostrarToast(
          'No es posible cargar más de 2 veces el código',
          'danger'
        );
      }
    } else {
      if (this.checkUserQrCode(qrCode) < 1) {
        if (qrCode === this.qr10) {
          this.user.userCredit += 10;
          this.credit = this.user.userCredit;
          this.user.userQrCredit.push(qrCode);
          this.updateUser();
          this.MostrarToast('Cargaste $10 con éxito', 'success');
        } else if (qrCode === this.qr50) {
          this.user.userCredit += 50;
          this.credit = this.user.userCredit;
          this.user.userQrCredit.push(qrCode);
          this.updateUser();
          this.MostrarToast('Cargaste $50 con éxito', 'success');
        } else if (qrCode === this.qr100) {
          this.user.userCredit += 100;
          this.credit = this.user.userCredit;
          this.user.userQrCredit.push(qrCode);
          this.updateUser();
          this.MostrarToast('Cargaste $100 con éxito', 'success');
        }
      } else {
        this.MostrarToast(
          'No es posible cargar más de una vez el código',
          'danger'
        );
      }
    }
  } // end of checkCreditCharge

  checkUserQrCode(qrCode: string) {
    return this.user.userQrCredit.filter((qr:any) => qr == qrCode).length;
  } // end of checkUserQrCode

  async MostrarToast(mensaje:string,color:string)
  {
    const toast = await this.toast.create({
      message:mensaje,
      color:color,
      duration:2000,
      position:'top'
    })

    await toast.present()
  }

}
