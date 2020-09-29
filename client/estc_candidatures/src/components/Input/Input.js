import React from 'react';
import { Input } from 'semantic-ui-react';


const input = (props) => {
  let inputElement = <Input {...props.elementConfig}
    iconPosition={props.iconPosition}
    icon={props.icon}
    size={props.size}
    value={props.value}
    onChange={props.changed} />;

  return (
    <React.Fragment>
      {inputElement}
    </React.Fragment>
  );
}

export default input;
