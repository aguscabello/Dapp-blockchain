# Repositorio Descentralizado de Obras - Trabajo Final

Esta es una Aplicación Descentralizada (DApp) que permite a los usuarios registrar la autoría de sus obras (imágenes, textos, etc.) en la blockchain de Ethereum. Los archivos se almacenan en IPFS a través de Pinata, y solo el registro de metadatos se guarda en un Smart Contract ERC-1155.

La DApp está desplegada y funcionando en la **red de pruebas Sepolia**.

## Requisitos Previos
1.  **Un navegador web** con la extensión [MetaMask](https://metamask.io/) instalada.
2.  **Node.js** y **npm** instalados en tu sistema.
3.  **ETH de prueba en la red Sepolia.** Podes obtenerlo de forma gratuita en un faucet como [https://sepolia-faucet.pk910.de/]

## Cómo Probar la Aplicación
1.  **Clona o descarga este repositorio.**

2.  **Moverte a la carpeta del frontend:**
    ```bash
    cd frontend
    ```
3.  **Instala las dependencias:**
    ```bash
    npm install
    ```

4.  **Correr la aplicación**
  ```bash
  npm start
   ```

 La aplicación se abrirá automáticamente en `http://localhost:3000`.

 5. **Conectar con metamask**
    *   Click en el botón "Conectar Billetera".
    *   La aplicación detecta si no estás en la red Sepolia y te pide que cambies de red. Acepta la solicitud en MetaMask.
    *   Una vez conectado, vas a poder ver la galería de obras y el formulario para subir la tuya.


