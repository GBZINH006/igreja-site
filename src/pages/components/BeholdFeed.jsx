import React from 'react';
import BeholdWidget from '@behold/react'; // Importe o componente

function BeholdFeed() {
  // O 'feedId' pode ser encontrado no seu painel da Behold, na seção "Embed Code"
  const meuFeedId = "wJtsPDUxJSl2oj3P5PcZ";

  return (
    <div>
      <h1>Meu Feed do Instagram</h1>
      {/* Use o componente como qualquer outro */}
      <BeholdFeed feedId={meuFeedId} />
    </div>
  );
}

export default BeholdFeed;
