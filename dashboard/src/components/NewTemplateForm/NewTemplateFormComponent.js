import React, {useContext, useRef, useState} from 'react';
import {AuthContext} from "../../context/AuthContext";
import {FetchWithToken} from "../../service/fetch-service";
import {Redirect, useHistory} from "react-router-dom";


const NewTemplateFormComponent = () => {

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
    FetchWithToken('/create-template/', authState, 'POST', formData)
        .then(data => setVariablesState(data))
  }

  const handleInput = (e) => {
    setFileState(e.target.files[0])
  }

  const handleChange = (e) => {
    setNameState(e.target.value)
  }
  return (
      variablesState ?

          <Redirect to={`/setup/${variablesState.letter_id}`}/> :

          <form className="form-group" onSubmit={onSubmit} ref={formRef}>
            <div className="form-control">
              <label htmlFor="templateName">Template Name: </label><input type="text" id="templateName" required
                                                                          onChange={handleChange} value={nameState}/>
            </div>
            <div className="form-control">
              <label htmlFor="templateFile">Template File: </label><input type="file" id="templateFile"
                                                                          onInput={handleInput} required/>
            </div>
            <div className="options-footer"><input type="submit" value="Upload"/><input type="button" value="Back"
                                                                                        onClick={() => {
                                                                                          history.push('/')
                                                                                        }}/></div>
          </form>
  );
};

export default NewTemplateFormComponent;