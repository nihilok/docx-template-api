import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from "../../context/AuthContext";
import {FetchWithToken} from "../../service/fetch-service";
import Loader from "../Loaders/Loader";
import './template-list.css'
import TemplateSetup from "./TemplateSetup";

const TemplateListView = () => {

  const [templateListState, setTemplateListState] = useState(null)
  const [variablesState, setVariablesState] = useState(null)
  const {authState} = useContext(AuthContext)

  const getTemplates = async () => {
    await FetchWithToken('/all-templates/', authState, setTemplateListState)

  }

  const getVariables = async (id) => {
    await FetchWithToken(`/get-variables/?letter_id=${id}`, authState, setVariablesState)
  }

  const handleOptions = (id) => (e) => {
    getVariables(id)
  }

  const handleUseTemplate = (id) => (e) => {

  }

  useEffect(() => {
    getTemplates()
  }, [])

  return (

      variablesState ? <TemplateSetup letter_id={variablesState.letter_id} requestObj={variablesState} variables={variablesState.variables} setState={setVariablesState}/> : templateListState ?
          <div>
            <h2>Current Templates:</h2>
            {templateListState.map(template => {
              return (
                  <div className="template-list-row" key={template.id}>
                    <div className="template-name">{template.name}</div>
                    <div className="template-link" onClick={handleOptions(template.id)}>Options</div>
                    <div className="template-link" onClick={handleUseTemplate(template.id)}>Use Template</div>
                  </div>
              )
            })}</div> : <Loader/>

  );
};

export default TemplateListView;