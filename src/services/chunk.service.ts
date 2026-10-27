export async function chunkText(texto: string): Promise<String[]> {
  const maxCaractere = 30;
  let index1 = 0, index2 = 0;
  let chunks: any[] = [];// textoCompleto.length / maxCaractere
  for (const caractere of texto) {
    index1++;
    chunks[index2] = (chunks[index2] || "") + caractere;
    if (index1 === maxCaractere) {
      index1 = 0;
      index2++;

    }
  }
  return chunks

}