import React, {useContext, useState} from 'react';
import {FetchWithToken} from "../../service/fetch-service";
import {AuthContext} from "../../context/AuthContext";
import {set} from "react-hook-form";
import {useHistory} from "react-router-dom";

const TemplateSetup = ({letter_id, variables, requestObj, setState}) => {

  const [variableListState, setVariableListState] = useState(variables)
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
        .then(()=>{
          setState(null)
          history.push('/');
        })

  }

  return (
      <>
        <h3>Set variable prompts:</h3>
        <form onSubmit={handleSubmit}>
          {variableListState ? variableListState.map((variable, index) => (
                  <div className="form-control" key={variable.var_name}>
                    <label>{variable.var_name}</label><input type="text" name={variable.var_name}
                                                             value={variable.var_prompt || ''}
                                                             onChange={handleChange(index)}/>
                  </div>
              ))
              : 'Nothing here, did you include variables e.g: {{variable}} in your template?'} <input type="submit"/>
        </form>
      </>
  );
};

export default TemplateSetup;