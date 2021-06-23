import React, {useContext, useState} from 'react';
import {FetchWithToken} from "../../service/fetch-service";
import {AuthContext} from "../../context/AuthContext";
import {useHistory} from "react-router-dom";
import DialogueOkCancel from "../Modals/DialogueOkCancel";

const TemplateSetup = ({letter_id, variables, requestObj, setState, getTemplates}) => {

  const [variableListState, setVariableListState] = useState(variables)
  const [deleting, setDeleting] = useState(false)
  const {authState} = useContext(AuthContext)
  let history = useHistory();

  const handleChange = index => (event) => {
    let newArr = [...variableListState];
    newArr[index].var_prompt = event.target.value;
    setVariableListState(newArr);
    setState(prev => ({
      ...prev,
      variables: variableListState
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const body = {
      letter_id: requestObj.letter_id,
      variables: variableListState
    }

    FetchWithToken(`/set-variables/`, authState, null, 'PUT', body)
        .then(() => {
          setState(null)
          history.push('/');
          window.location.reload()  // TODO: SORT THIS OUT!
        })

  }

  const handleCancel = () => {
      setState(null)
  }

  const handleDelete = (e) => {
    setDeleting(true)
    console.log(deleting)
  }

  const deleteTemplate = (id) => {
    FetchWithToken(`/delete-template/?letter_id=${id}`, authState, null, 'DELETE')
        .finally(() => {
          setDeleting(false)
          setState(null)
          history.push('/')
          window.location.reload() // TODO: SORT THIS OUT!
        })
  }

  return (
      <>
        <h3>Set variable prompts:</h3>
        <small>Here you can specify more 'human-readable' prompts for each variable / section. If you leave this blank, the displayed variable name will be used as prompt.</small>
        <form onSubmit={handleSubmit} className="form-group">
          {variableListState.length ? variableListState.map((variable, index) => (
                  <div className="form-control" key={variable.var_name}>
                    <label>{variable.var_name.startsWith('__para_') ? variable.var_name.substring(7) + ' (paragraph)' : variable.var_name}</label>
                      <input type="text" name={variable.var_name}
                             value={variable.var_prompt || ''}
                             onChange={handleChange(index)}/>
                  </div>
              ))
              : <div style={{margin: '5rem 0'}}>Nothing here, did you include variables e.g: {"{{variable}}"} in your template?</div> }
        </form>
        <div className="options-footer">
          <input type="submit" onClick={handleCancel} value="Cancel"/>
          <input type="submit" value="Save" onClick={handleSubmit}/>
          <input type="submit" onClick={handleDelete} value="Delete"/></div>
        {deleting ? <DialogueOkCancel callback={() => deleteTemplate(letter_id)}
                                      cancel={() => setDeleting(false)}/> : ''}
      </>
  );
};

export default TemplateSetup;