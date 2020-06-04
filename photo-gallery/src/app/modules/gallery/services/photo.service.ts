import { Injectable } from '@angular/core';
import {
  Plugins,
  CameraResultType,
  Capacitor,
  FilesystemDirectory,
  CameraPhoto,
  CameraSource,
  WebViewPath
} from '@capacitor/core';
import { Platform } from '@ionic/angular';

const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public fotos: FotoInterface[] = [];
  private FOTOSTORAGE = 'fotos-app-galeria';
  private plataforma: Platform;

  constructor(plataforma: Platform) {
    this.plataforma = plataforma;
  }

  public async adicionarFotoAGaleria() {
    const foto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    await this.salvarImagem(foto);

    this.fotos.unshift({
      filepath: 'Nova foto',
      webviewPath: foto.webPath
    });

    Storage.set({
      key: this.FOTOSTORAGE,
      value: this.plataforma.is('hybrid')
              ? JSON.stringify(this.fotos)
              : JSON.stringify(this.fotos
                .map((f: FotoInterface) => {
                const copiaFoto = { ...f };
                delete copiaFoto.base64;
                return copiaFoto;
              }))
    });
  }

  private async lerEmBase64(foto: CameraPhoto) {

    if (this.plataforma.is('hybrid')) {
      const arquivo = await Filesystem
        .readFile({ path: foto.path });

      return arquivo.data;
    }

    const webPath = await fetch(foto.webPath!);
    const blob = await webPath.blob();

    return await this.converterParaBase64(blob) as string;
  }

  private async converterParaBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = reject;

      reader.onload = () => {
          resolve(reader.result);
      };

      reader.readAsDataURL(blob);
    });
  }

  private async salvarImagem(foto: CameraPhoto) {
    const fotoBase64 = await this
      .lerEmBase64(foto);

    const nomeDoArquivo = `${new Date().getTime()}.jpeg`;

    const fotoSalva = await Filesystem
      .writeFile({
        path: nomeDoArquivo,
        data: fotoBase64,
        directory: FilesystemDirectory.Data
      });

    let retorno: {
      filepath: string,
      webviewPath: string | WebViewPath
    } = {
      filepath: nomeDoArquivo,
      webviewPath: foto.webPath
    };

    if (this.plataforma.is('hybrid')) {
      retorno = {
        filepath: fotoSalva.uri,
        webviewPath: Capacitor.convertFileSrc(fotoSalva.uri),
      };
    }

    return retorno;
  }

  public async carregarFotosDosArquivos() {
    const fotos = await Storage.get({
      key: this.FOTOSTORAGE
    });

    this.fotos = JSON.parse(fotos.value) || [];

    if (!this.plataforma.is('hybrid')) {
      for (const foto of this.fotos) {
        const arquivoFoto = await Filesystem
          .readFile({
            path: foto.filepath,
            directory: FilesystemDirectory.Data
          });

        foto.base64 = `data:image/jpeg;base64,${arquivoFoto.data}`;
      }
    }
  }
}

interface FotoInterface {
  filepath: string;
  webviewPath: string;
  base64?: string;
}
