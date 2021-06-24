import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from "../../context/AuthContext";
import {FetchWithToken} from "../../service/fetch-service";
import './template-list.css'
import NewTemplateView from "../NewTemplateForm/NewTemplateView";
import {Link, Redirect, useHistory} from "react-router-dom";


const TemplateListView = () => {

  const [templateListState, setTemplateListState] = useState(null)
  const [variablesState, setVariablesState] = useState(null)
  const {authState} = useContext(AuthContext)
  let history = useHistory();

  const getTemplates = async () => {
    await FetchWithToken('/all-templates/', authState).then(data => setTemplateListState(data))
  }

  const getVariables = async (id) => {
    await FetchWithToken(`/get-variables/?letter_id=${id}`, authState)
  }

  const handleOptions = (id) => (e) => {
    history.push(`/setup/${id}`)
  }

  const handleUseTemplate = (id) => (e) => {
    history.push(`/render/${id}`)
  }

  useEffect(() => {
    getTemplates().catch(err => console.log(err))
  }, [])

  return (

      variablesState ? <Redirect to={`setup/${variablesState.letter_id}`} /> :
          templateListState && templateListState.length ?
              <div>
                <h2>Current Report Templates:</h2>
                {templateListState.map(template => {
                  return (
                      <div className="template-list-row" key={template.id}>
                        <div className="template-name">{template.name}</div>
                        <div className="template-link" onClick={handleOptions(template.id)}>Edit</div>
                        <div className="template-link" onClick={handleUseTemplate(template.id)}>Use Template</div>
                      </div>
                  )
                })}
                <div className="options-footer"><Link to="/new">Upload new template</Link>
                  <Link to="/logout">Logout</Link></div>
              </div> : <NewTemplateView getTemplates={getTemplates}/>

);
};

export default TemplateListView;