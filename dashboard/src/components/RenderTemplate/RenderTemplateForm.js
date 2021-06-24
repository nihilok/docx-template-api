import React, {useContext, useEffect, useRef, useState} from 'react';
import {FetchFile, FetchWithToken} from "../../service/fetch-service";
import {AuthContext} from "../../context/AuthContext";
import {useHistory} from "react-router-dom";
import {useParams} from 'react-router-dom';
import Loader from "../Loaders/Loader";
import {loadingDelay} from "../../service/constants";


const RenderTemplateForm = () => {

  const letter_id = useParams()
  const [isLoading, setIsLoading] = useState(true)

  const [variables, setVariables] = useState(null)
  useEffect(() => {
    FetchWithToken(`/get-variables/?letter_id=${letter_id.id}`, authState)
        .then(data => setVariables(data))
        .catch((err) => console.log(err))
        .finally(() => setTimeout(() => setIsLoading(false), loadingDelay))
  }, [])

  const {authState} = useContext(AuthContext)
  const [downloadReady, setDownloadReady] = useState(false)
  const downloadRef = useRef()
  let history = useHistory();

  const handleChange = index => (event) => {
    let newArr = variables.variables;
    newArr = [...newArr]
    newArr[index].response = event.target.value;
    setVariables(prev => ({
      ...prev,
      variables: newArr
    }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const d = new Date()
    const dateString = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`

    const body = {
      responses: variables.variables,
    }

    let checkResponse = false


    body.responses.forEach(variable => {
      if (!variable.response) {
        variable.response = ''
      } else {
        checkResponse = true
      }
    })

    console.log(body)

    if (checkResponse) {
      FetchFile(`/render-template/?letter_id=${variables.letter_id}&local_time=${dateString}`, authState, 'POST', body)
        .then((data) => {
          const href = window.URL.createObjectURL(data);
          const a = downloadRef.current;
          a.download = `GeneratedReport-${variables.letter_id}-${new Date()}.docx`;
          a.href = href;
          a.click()
          setDownloadReady(true)
        }).catch(err => console.log(err))
    } else {
      alert('Template is empty!')
    }

  }

  return (
      <>
        <h3>Render Template:</h3>
        <form onSubmit={handleSubmit} className={"form-group"}>
          {isLoading ? <Loader classname={"Loader-trans Loader-black"}/> :
              variables ? variables.variables.map((variable, index) => (
                      <div className="form-control" key={variable.var_name}>
                        <label>{variable.var_prompt ? variable.var_prompt :
                            variable.var_name.startsWith('__para_') ?
                                variable.var_name.substring(7) + ' (paragraph)' : variable.var_name}</label>
                        {variable.var_name.startsWith('__para_') ?
                            <textarea name={variable.var_name}
                                      onChange={handleChange(index)}
                                      value={variable.response || ''}
                                      rows="8"/> :
                            variable.var_name.startsWith('time_') ?
                                <input type="time" name={variable.var_name}
                                       value={variable.response || ''}
                                       onChange={handleChange(index)}/> :
                                <input type="text" name={variable.var_name}
                                       value={variable.response || ''}
                                       onChange={handleChange(index)}/>}
                      </div>
                  ))
                  : 'Nothing here, did you include variables e.g: {{variable}} in your template?'}
          <div className={!isLoading ? "form-control" : 'my-3'}>
            <div/>
            <div className={!isLoading ? "options-footer" : ''}>

              <input type="button" value="Cancel" onClick={() => {
                history.push('/')
              }} className={!isLoading ? "bg-danger" : ''}/>
              {!isLoading ? <input type="submit"
                                   value="Render Report" className={"bg-success"}/> : ''}

            </div>
          </div>
          <a style={{marginTop: '1rem'}}
             ref={downloadRef}>{downloadReady ? 'Download Report Again' : ''}</a>
        </form>
      </>
  );
};

export default RenderTemplateForm;