// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";



contract ObrasRepo is ERC1155, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _obraIds;

    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC1155("") {}

    event ObraCreada(uint256 id, address autor, string metadataURI);


    /// @notice Sube una nueva obra asociada a un URI IPFS
    /// @param metadataURI El URI a los metadatos (JSON) en IPFS
    function subirObra(string memory metadataURI) public {
        require(bytes(metadataURI).length > 0, unicode"URI inválido");

        uint256 nuevaId = _obraIds.current();

        _tokenURIs[nuevaId] = metadataURI;
        _mint(msg.sender, nuevaId, 1, "");

        emit ObraCreada(nuevaId, msg.sender, metadataURI);

        _obraIds.increment();
     }

    
     /// @notice Devuelve el URI de metadatos asociado a un token
    function uri(uint256 id) public view override returns (string memory) {
        require(bytes(_tokenURIs[id]).length > 0, "El token no existe");
        return _tokenURIs[id];
    }


     /// @notice Devuelve la cantidad total de obras registradas
    function cantidadObras() public view returns (uint256) {
        return _obraIds.current();
    }


}