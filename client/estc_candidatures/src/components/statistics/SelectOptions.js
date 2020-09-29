import React from 'react'
import { Dropdown, Form } from 'semantic-ui-react'

const renderLabel = label => ({
    color: 'blue',
    content: `${label.text}`,
    icon: 'check',
});

class SelectOptions extends React.Component {

    onOptionChange = (ev, el) => {
        this.props.onChange(ev, el);

    };


    render() {

        return (
            <Form.Field>
                <label>{this.props.placeholder}</label>
                <Dropdown
                    multiple
                    selection
                    width={16}
                    onChange={this.onOptionChange.bind(this)}
                    options={this.props.options}
                    placeholder={this.props.placeholder}
                    renderLabel={renderLabel}
                    name={this.props.name}
                />
            </Form.Field>
        );
    }


}

export default SelectOptions