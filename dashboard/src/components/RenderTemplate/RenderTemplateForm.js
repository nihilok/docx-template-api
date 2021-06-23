import React, {useContext, useEffect, useRef, useState} from 'react';
import {FetchFile, FetchWithToken} from "../../service/fetch-service";
import {AuthContext} from "../../context/AuthContext";
import {useHistory} from "react-router-dom";
import DialogueOkCancel from "../Modals/DialogueOkCancel";
import {useParams} from 'react-router-dom';

const RenderTemplateForm = () => {

  const letter_id = useParams()
  const [variables, setVariables] = useState(null)
  useEffect(()=>{
    FetchWithToken(`/get-variables/?letter_id=${letter_id.id}`, authState, setVariables, )
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
        .then((data)=>{
          const href = window.URL.createObjectURL(data);
          const a = downloadRef.current;
          a.download = `GeneratedReport-${variables.letter_id}-${new Date()}.docx`;
          a.href = href;
        }).catch(err=>console.log(err))
  }

  return (
      <>
        <h3>Render Template:</h3>
        <form onSubmit={handleSubmit} className={"form-group"}>
          {variables ? variables.variables.map((variable, index) => (
                  <div className="form-control" key={variable.var_name}>
                    <label>{variable.var_prompt}</label>{variable.var_name.startsWith('__para_') ?
                      <textarea name={variable.var_name}
                                onChange={handleChange(index)}
                                value={variable.response || ''}
                      rows="8"/> :
                      <input type="text" name={variable.var_name}
                             value={variable.response|| ''}
                             onChange={handleChange(index)}/>}
                  </div>
              ))
              : 'Nothing here, did you include variables e.g: {{variable}} in your template?'} {variables? <input type="submit"
                                                                                                       value="Render Report"/>: ''}
            <a ref={downloadRef}>Download</a>
        </form>
        <div className="options-footer">

        </div>

      </>
  );
};

export default RenderTemplateForm;