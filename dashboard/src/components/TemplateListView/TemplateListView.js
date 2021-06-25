import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from "../../context/AuthContext";
import {FetchWithToken} from "../../service/fetch-service";
import './template-list.css'
import NewTemplateView from "../NewTemplateForm/NewTemplateView";
import {Link, Redirect, useHistory} from "react-router-dom";
import Loader from "../Loaders/Loader";
import {loadingDelay} from "../../service/constants";


const TemplateListView = () => {

  const [isLoading, setIsLoading] = useState(true)
  const [templateListState, setTemplateListState] = useState(null)
  const [variablesState, setVariablesState] = useState(null)
  const {authState} = useContext(AuthContext)
  let history = useHistory();

  const getTemplates = async () => {
    await FetchWithToken('/all-templates/', authState)
        .then(data => setTemplateListState(data))
        .catch(err => console.log(err))
        .finally(() => setTimeout(() => setIsLoading(false), loadingDelay))
  }

  // const getVariables = async (id) => {
  //   await FetchWithToken(`/get-variables/?letter_id=${id}`, authState)
  // }

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
      <div>
        <h2>Current Report Templates:</h2>
        {isLoading ? <Loader classname={"Loader-trans Loader-black"}/> :
            variablesState ? <Redirect to={`setup/${variablesState.letter_id}`}/> :
                templateListState && templateListState.length ?
                    <div className="list-outer">
                      {templateListState.map(template => {
                        return (
                            <div className="template-list-row" key={template.id}>
                              <div className="template-name">{template.name}</div>
                              <div className="template-link"><Link to={`setup/${template.id}`}>Edit</Link></div>
                              <div className="template-link"><Link to={`render/${template.id}`}>Use Template</Link></div>
                            </div>
                        )
                      })}

                    </div>
                    : <Redirect to={'/new'}/>}
        <div className="options-footer full-width"><Link to="/new">Upload new template</Link>
                        <Link to="/logout" className="text-danger">Logout</Link></div>
      </div>

  );
};

export default TemplateListView;