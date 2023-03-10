import React, {FC} from 'react';
import { ConfirmationBoxProps } from './types';

const ConfirmationBox: FC<ConfirmationBoxProps> = ({ message, confirmHandler, closeHandler }) => {

  const handleConfirm = () => {
    confirmHandler();
    closeHandler();
  };

  return (
    <>
      <div className="modal-backdrop" />
      <div className="confirmation-box show ">
        <div className="msg">{message}</div>
        <button onClick={handleConfirm}>Confirm</button>
        <button onClick={() => closeHandler()}>Cancel</button>
      </div>
    </>
  );
};

export default ConfirmationBox;