import React from "react";

export function NoTokensMessage({ selectedAddress }) {
  return (
    <div className='no-tokens'>
      <p>You don't have tokens to transfer</p>
      <p>
        Maybe buy some perchance?
      </p>
    </div>
  );
}
