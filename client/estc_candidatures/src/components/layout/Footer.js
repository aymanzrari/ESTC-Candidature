import React, { Component } from 'react'
import {
    Container,
    Divider,
    Grid,
    Header,
    Image,
    List,
    Segment,
} from 'semantic-ui-react'
export default class Footer extends Component {
    render() {
        return (
            <div>
                <Segment inverted vertical style={{ margin: '0em 0em 0em', padding: '0em 0em' ,backgroundColor: "#008080",}}>
                    <Container textAlign='center'>
                        <Divider inverted section />
                        <Image centered size='mini' src='/logo.png' />
                        <List horizontal inverted divided link size='small'>
                            <List.Item as='a' href='#'>
                                Site Map</List.Item>
                            <List.Item as='a' href='#'>
                                Contact Us</List.Item>
                            <List.Item as='a' href='#'>
                                Terms and Conditions</List.Item>
                            <List.Item as='a' href='#'>
                                Privacy Policy</List.Item>
                        </List>
                    </Container>
                </Segment>
            </div>
        )
    }
}
