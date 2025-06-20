const { expect } = require("chai");
const { ethers } = require("hardhat");

// 'describe' es una suite de pruebas para nuestro contrato
describe("ObrasRepo Contract", function () {
    let ObrasRepo;
    let obrasRepo;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        // Obtenemos el "molde" o la "fábrica" para nuestro contrato
        ObrasRepo = await ethers.getContractFactory("ObrasRepo");

        // Obtenemos las cuentas de prueba que Hardhat nos proporciona
        [owner, addr1, addr2] = await ethers.getSigners();

        // Desplegamos una nueva instancia del contrato, que será propiedad de 'owner'
        obrasRepo = await ObrasRepo.deploy();
    });


    describe("Deployment", function () {
        it("Debería asignar el rol de 'owner' al desplegador", async function () {
            expect(await obrasRepo.owner()).to.equal(owner.address);
        });

        it("La cantidad inicial de obras debería ser 0", async function () {
            expect(await obrasRepo.cantidadObras()).to.equal(0);
        });
    });


    describe("Subiendo Obras", function () {
        it("Debería permitir a un usuario subir una obra y mintear un token", async function () {
            const metadataURI = "ipfs://Qm...";
            
            // Conectamos como 'addr1' para simular que otro usuario llama a la función
            await obrasRepo.connect(addr1).subirObra(metadataURI);
            
            // Verificamos que el balance del token con ID 0 para 'addr1' es 1
            expect(await obrasRepo.balanceOf(addr1.address, 0)).to.equal(1);
        });

        it("Debería emitir un evento 'ObraCreada' al subir una obra", async function () {
            const metadataURI = "ipfs://Qm...";

            // Verificamos que la transacción emite el evento correcto con los argumentos correctos
            await expect(obrasRepo.connect(addr1).subirObra(metadataURI))
                .to.emit(obrasRepo, "ObraCreada")
                .withArgs(0, addr1.address, metadataURI); // El primer ID es 0
        });

        it("Debería incrementar el contador de obras después de cada subida", async function () {
            const metadataURI1 = "ipfs://Qm...1";
            const metadataURI2 = "ipfs://Qm...2";

            await obrasRepo.connect(addr1).subirObra(metadataURI1);
            expect(await obrasRepo.cantidadObras()).to.equal(1);
            
            await obrasRepo.connect(addr2).subirObra(metadataURI2);
            expect(await obrasRepo.cantidadObras()).to.equal(2);
        });

        it("Debería fallar si el metadataURI está vacío", async function () {
            await expect(obrasRepo.connect(addr1).subirObra(""))
                .to.be.revertedWith("URI inválido");
        });
    });

    describe("Consultando URIs", function () {
        it("Debería devolver el URI correcto para un token existente", async function () {
            const metadataURI = "ipfs://QmTestURI";
            
            // 'addr1' sube una obra (que obtendrá el ID 0)
            await obrasRepo.connect(addr1).subirObra(metadataURI);

            // Verificamos que la función 'uri' devuelve el URI correcto para el token 0
            expect(await obrasRepo.uri(0)).to.equal(metadataURI);
        });

        it("Debería fallar al consultar el URI de un token que no existe", async function () {
            // Intentamos obtener el URI para el token con ID 1, que no ha sido creado.
            await expect(obrasRepo.uri(1)).to.be.revertedWith("El token no existe");
        });
    });
});