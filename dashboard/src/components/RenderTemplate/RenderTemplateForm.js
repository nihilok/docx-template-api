import React, {useContext, useEffect, useRef, useState} from 'react';
import {FetchFile, FetchWithToken} from "../../service/fetch-service";
import {AuthContext} from "../../context/AuthContext";
import {useHistory} from "react-router-dom";
import {useParams} from 'react-router-dom';


const RenderTemplateForm = () => {

  const letter_id = useParams()
  const [variables, setVariables] = useState(null)
  useEffect(() => {
    FetchWithToken(`/get-variables/?letter_id=${letter_id.id}`, authState)
        .then(data => setVariables(data))
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

    const body = {
      responses: variables.variables
    }

    console.log(body)


    FetchFile(`/render-template/?letter_id=${variables.letter_id}`, authState, 'POST', body)
        .then((data) => {
          const href = window.URL.createObjectURL(data);
          const a = downloadRef.current;
          a.download = `GeneratedReport-${variables.letter_id}-${new Date()}.docx`;
          a.href = href;
          setDownloadReady(true)
        }).catch(err => console.log(err))
  }

  return (
      <>
        <h3>Render Template:</h3>
        <form onSubmit={handleSubmit} className={"form-group"}>
          {variables ? variables.variables.map((variable, index) => (
                  <div className="form-control" key={variable.var_name}>
                    <label>{variable.var_prompt ? variable.var_prompt :
                        variable.var_name.startsWith('__para_') ?
                            variable.var_name.substring(7) + ' (paragraph)' : variable.var_name}</label>
                    {variable.var_name.startsWith('__para_') ?
                        <textarea name={variable.var_name}
                                  onChange={handleChange(index)}
                                  value={variable.response || ''}
                                  rows="8"/> :
                        <input type="text" name={variable.var_name}
                               value={variable.response || ''}
                               onChange={handleChange(index)}/>}
                  </div>
              ))
              : 'Nothing here, did you include variables e.g: {{variable}} in your template?'}

          <div className="options-footer"><input type="button" value="Back" onClick={() => {
            history.push('/')
          }}/>{variables ? <input type="submit"
                                  value="Render Report"/> : ''}</div>
          <a style={{marginTop: '1rem'}}
             ref={downloadRef}>{downloadReady ? 'Download Report' : ''}</a>
        </form>
      </>
  );
};

export default RenderTemplateForm;