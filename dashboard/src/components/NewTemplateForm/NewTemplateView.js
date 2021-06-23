import React from 'react';
import NewTemplateFormComponent from "./NewTemplateFormComponent";

const NewTemplateView = ({getTemplates}) => {
  return (
      <>
        <h3>Upload Template</h3>
        <NewTemplateFormComponent getTemplates={getTemplates || undefined}/>
      </>
  );
};

export default NewTemplateView;