import React, {useContext, useRef, useState} from 'react';
import {AuthContext} from "../../context/AuthContext";
import {FetchWithToken} from "../../service/fetch-service";
import {useHistory} from "react-router-dom";
import TemplateSetup from "../TemplateListView/TemplateSetup";

const NewTemplateFormComponent = ({getTemplates}) => {

  const {authState} = useContext(AuthContext)
  const formRef = useRef(null)
  const [fileState, setFileState] = useState(null)
  const [nameState, setNameState] = useState('')
  const [variablesState, setVariablesState] = useState(null)
  let history = useHistory();

  const onSubmit = (e) => {
    e.preventDefault()
    console.log(fileState)
    let formData = new FormData()
    formData.append('name', nameState)
    formData.append('file', fileState, fileState.name)
    FetchWithToken('/create-template/', authState, setVariablesState, 'POST', formData)
  }

  const handleInput = (e) => {
      setFileState(e.target.files[0])
  }

  const handleChange = (e) => {
    setNameState(e.target.value)
  }
  return (
      variablesState ? <>
          <TemplateSetup letter_id={variablesState.letter_id}
                         requestObj={variablesState}
                         variables={variablesState.variables}
                         setState={setVariablesState}
                         getTemplates={getTemplates ? getTemplates : undefined}/>
          </> :

      <form className="form-group" onSubmit={onSubmit} ref={formRef} encType={"multipart/form-data"}>
        <div className="form-control">
          <label htmlFor="templateName">Template Name: </label><input type="text" id="templateName" onChange={handleChange} value={nameState}/>
        </div>
        <div className="form-control">
          <label htmlFor="templateFile">Template File: </label><input type="file" id="templateFile" onInput={handleInput}/>
        </div>
        <input type="submit" value="Submit"/>
      </form>
  );
};

export default NewTemplateFormComponent;