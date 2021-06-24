import React from 'react';
import './modals.css'

const DialogueOkCancel = ({callback, cancel, title="Are you sure?", message=null}) => {
  return (
      <div className="dimmed-bg">
        <div className="modal">
          <div className="modal-header">
            {title}
          </div>
          {message ? <div className="modal-body">
            {message}
          </div> : ''}
          <div className="modal-footer">
            <input type="submit" value="Cancel" onClick={cancel} className={"bg-success"}/><input type="submit" value="OK" onClick={callback} className={"bg-danger"}/>
          </div>
        </div>
      </div>
  );
};

export default DialogueOkCancel;