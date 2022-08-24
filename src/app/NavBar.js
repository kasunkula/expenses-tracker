import * as React from "react";
import Container from 'react-bootstrap/Container';
import {Navbar} from 'react-bootstrap';

class NavBar extends React.Component {
    render() {
        return (
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand styles={{width: "auto"}} onClick={() => this.props.backToDashboard()}>අයවැය</Navbar.Brand>
                    <Navbar.Text>
                        <a onClick={this.props.signOut}>
                        {this.props.user.attributes.email.split("@")[0]}</a>
                    </Navbar.Text>
                </Container>
            </Navbar>
        )
    }
}

export default NavBar;