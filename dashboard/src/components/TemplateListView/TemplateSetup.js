import React, {useContext, useEffect, useState} from 'react';
import {FetchWithToken} from "../../service/fetch-service";
import {AuthContext} from "../../context/AuthContext";
import {useHistory, useParams} from "react-router-dom";
import DialogueOkCancel from "../Modals/DialogueOkCancel";
import Loader from "../Loaders/Loader";
import {loadingDelay} from "../../service/constants";

const TemplateSetup = () => {

  const letter_id = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [variableListState, setVariableListState] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const {authState} = useContext(AuthContext)
  let history = useHistory();

  useEffect(() => {
    console.log()
    FetchWithToken(`/get-variables/?letter_id=${letter_id.id}`, authState)
        .then((data) => setVariableListState(data.variables))
        .catch((err) => console.log(err))
        .finally(() => setTimeout(() => setIsLoading(false), loadingDelay))
  }, [])

  const handleChange = index => (event) => {
    let newArr = [...variableListState];
    newArr[index].var_prompt = event.target.value;
    setVariableListState(newArr);
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const body = {
      letter_id: letter_id.id,
      variables: variableListState
    }

    FetchWithToken(`/set-variables/`, authState, 'PUT', body)
        .then(() => {
          history.push('/');
        })

  }

  const handleCancel = () => {
    history.push('/')
  }

  const handleDelete = (e) => {
    setDeleting(true)
    console.log(deleting)
  }

  const deleteTemplate = (id) => {
    FetchWithToken(`/delete-template/?letter_id=${id}`, authState, 'DELETE')
        .finally(() => {
          setDeleting(false)
          history.push('/')
        })
  }

  return (
      <>
        <h3>Set variable prompts:</h3>
        <small>Here you can specify more 'human-readable' prompts for each variable / section. If you leave this blank,
          the displayed variable name will be used as prompt.</small>
        {isLoading ? <Loader classname={"Loader-trans Loader-black"}/> :
            <form onSubmit={handleSubmit} className="form-group">
              {variableListState && variableListState.length ? variableListState.map((variable, index) => (
                      <div className="form-control" key={variable.var_name}>
                        <label>{variable.var_name.startsWith('__para_') ? variable.var_name.substring(7) + ' (paragraph)' : variable.var_name}</label>
                        <input type="text" name={variable.var_name}
                               value={variable.var_prompt || ''}
                               onChange={handleChange(index)}/>
                      </div>
                  ))
                  :
                  <div style={{margin: '5rem 0'}}>Nothing here, did you include variables e.g: {"{{variable}}"} in your
                    template?</div>}
            </form>}
        <div className="form-control">
          <div/>
          <div className="options-footer">
            <input type="submit" onClick={handleCancel} value="Cancel" className=""/>

            {!isLoading ? <input type="submit" onClick={handleDelete} value="Delete" className="bg-danger"/> : ''}
            {!isLoading ? <input type="submit" value="Save" onClick={handleSubmit} className="bg-success"/> : ''}
          </div>
        </div>
        {deleting ? <DialogueOkCancel callback={() => deleteTemplate(letter_id.id)}
                                      cancel={() => setDeleting(false)}/> : ''}
      </>
  );
};

export default TemplateSetup;