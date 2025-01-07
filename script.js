function copiarTexto() {
    var txtSarkis = document.getElementById("txt-sarkis");

    txtSarkis.select();
    txtSarkis.setSelectionRange(0, 99999);

    document.execCommand("copy");

    var mensagem = document.getElementById("mensagem");
    mensagem.style.display = "block";

    setTimeout(function() {
        mensagem.style.display = "none";
    }, 2000);
}