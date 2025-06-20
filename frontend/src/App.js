import React, { useState, useEffect } from "react";
import Web3 from "web3";
import ABI from "./ObrasRepo.json";
import './App.css'; 
import { create } from 'ipfs-http-client';


const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const client = create({ url: "https://ipfs.io" });



function App() {
  const [provider, setProvider] = useState(null);
  const [cuenta, setCuenta] = useState(null);
  const [contrato, setContrato] = useState(null);
  const [uri, setUri] = useState("");
  const [feedback, setFeedback] = useState("");
  const [obras, setObras] = useState([]);
  const [cargando, setCargando] = useState(true); 

 
  const conectarBilletera = async () => {
    setFeedback("Conectando...");
    if (window.ethereum) {
      try {
        const cuentas = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const web3Instance = new Web3(window.ethereum);
        setProvider(web3Instance);
        
        const cuentaActual = cuentas[0];
        setCuenta(cuentaActual);

        const instanciaContrato = new web3Instance.eth.Contract(ABI.abi, CONTRACT_ADDRESS);
        setContrato(instanciaContrato);

        setFeedback("Billetera conectada exitosamente.");
      } catch (error) {
        console.error("Usuario rechazó la conexión.", error);
        setFeedback("Error al conectar la billetera. Por favor, inténtalo de nuevo.");
      }
    } else {
      alert("Por favor, instala MetaMask para usar esta DApp.");
      setFeedback("MetaMask no detectado.");
    }
  };


  const subirMetadataAIPFS = async (obra) => {
    const metadata = {
      name: obra.titulo,
      description: obra.descripcion,
      type: obra.tipo,
      image: obra.imagenIPFS ? `ipfs://${obra.imagenIPFS}` : undefined,
    };

    const metadataString = JSON.stringify(metadata);
    const result = await client.add(metadataString);
    return `ipfs://${result.path}`;
  };

 
  const cargarObras = async (instanciaContrato) => {
    if (!instanciaContrato) return;
    setCargando(true);
    setFeedback("Cargando obras desde la blockchain...");

    try {
      const cantidad = await instanciaContrato.methods.cantidadObras().call();
      const obrasCargadas = [];

      for (let i = 0; i < cantidad; i++) {
        const obraURI = await instanciaContrato.methods.uri(i).call();
        
        const metadataURL = obraURI.replace("ipfs://", "https://ipfs.io/ipfs/");

        try {
          const res = await fetch(metadataURL);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const metadata = await res.json();
          obrasCargadas.push({ id: i, metadata });
        } catch (e) {
          console.warn(`No se pudo cargar la metadata para el URI: ${metadataURL}`, e);
          obrasCargadas.push({ id: i, metadata: { name: "Error al cargar", description: `URI: ${obraURI}` } });
        }
      }
      setObras(obrasCargadas.reverse()); 
      setFeedback("Obras cargadas.");
    } catch (error) {
      console.error("Error al cargar las obras:", error);
      setFeedback("Error al cargar las obras desde el contrato.");
    } finally {
      setCargando(false);
    }
  };


  useEffect(() => {
    if (contrato) {
      cargarObras(contrato);
    }
  }, [contrato]);


 const subirObraFormulario = async (e) => {
    e.preventDefault();
    const form = e.target;
    const titulo = form.titulo.value;
    const descripcion = form.descripcion.value;
    const tipo = form.tipo.value;
    const archivo = form.imagen.files[0];

    if (!contrato || !cuenta || !titulo || !descripcion || !tipo) {
      setFeedback("Faltan campos requeridos.");
      return;
    }

    setFeedback("Subiendo a IPFS...");

    try {
      let imagenIPFS = null;
      if (archivo) {
        const res = await client.add(archivo);
        imagenIPFS = res.path;
      }

      const metadataURI = await subirMetadataAIPFS({ titulo, descripcion, tipo, imagenIPFS });

      setFeedback("Registrando obra en la blockchain...");
      await contrato.methods.subirObra(metadataURI).send({ from: cuenta });

      setFeedback("¡Obra subida correctamente!");
      form.reset();
      await cargarObras(contrato);
    } catch (error) {
      console.error("Error al subir obra:", error);
      setFeedback("Error al subir la obra.");
    }
  };

  
  if (!cuenta) {
    return (
      <div className="container text-center py-5">
        <h2>📚 Repositorio de Obras</h2>
        <p>Conecta tu billetera para empezar.</p>
        <button className="btn btn-primary btn-lg" onClick={conectarBilletera}>
          Conectar MetaMask
        </button>
        {feedback && <p className="mt-3">{feedback}</p>}
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">📚 Repositorio de Obras</h2>
      
      <div className="mb-3">
        <label className="form-label">Cuenta conectada:</label>
        <div className="form-control text-muted" style={{ overflowX: 'auto' }}>{cuenta}</div>
      </div>

      <form onSubmit={subirObraFormulario}>
        <div className="mb-3">
          <input type="text" name="titulo" className="form-control" placeholder="Título" required />
        </div>
        <div className="mb-3">
          <textarea name="descripcion" className="form-control" placeholder="Descripción" required />
        </div>
        <div className="mb-3">
          <select name="tipo" className="form-select" required>
            <option value="">Tipo de obra</option>
            <option value="Texto">Texto</option>
            <option value="Imagen">Imagen</option>
            <option value="Audio">Audio</option>
            <option value="Video">Video</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div className="mb-3">
          <input type="file" name="imagen" className="form-control" accept="image/*" />
        </div>
        <button type="submit" className="btn btn-primary">Subir Obra</button>
      </form>
      
      {feedback && <div className="alert alert-info">{feedback}</div>}
      
      <hr />

      <h3 className="text-center">Galería de Obras</h3>
      {cargando && <p className="text-center">Cargando...</p>}
      <div className="row">
        {obras.map((obra) => (
          <div className="col-md-4 mb-4" key={obra.id}>
            <div className="card h-100">
              {obra.metadata.image && (
                <img
                  src={obra.metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
                  className="card-img-top"
                  alt={obra.metadata.name || "Imagen de la obra"}
                  onError={(e) => { e.target.style.display = 'none'; }} 
                />
              )}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{obra.metadata.name || "Sin título"}</h5>
                <p className="card-text flex-grow-1">{obra.metadata.description || "Sin descripción."}</p>
                {obra.metadata.type && <span className="badge bg-secondary align-self-start">{obra.metadata.type}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;