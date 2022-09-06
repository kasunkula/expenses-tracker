import * as React from "react";
import Container from 'react-bootstrap/Container';
import {Navbar, Button} from 'react-bootstrap';

class NavBar extends React.Component {
    render() {
        return (
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Container>
                    <Button variant="dark" size="sm" onClick={() => this.props.backToDashboard()}>
                        අයවැය
                    </Button>

                    {
                        (this.props.year && this.props.month) &&
                        <div style={{
                            display: "flex",
                            alignContent: "space-around",
                            width: "45%"
                        }}>
                            <Button variant="dark" size="sm" onClick={() => this.props.goToPreviousMonth()}>
                                {"<"}
                            </Button>
                            <Navbar.Text style={{
                                paddingLeft: "5px",
                                paddingRight: "5px",
                                display: "flex",
                                alignContent: "space-around"
                            }}>
                                {new Date(this.props.year, this.props.month).toLocaleString('en-us', {month: 'short'})}
                                {" "}
                                {new Date(this.props.year, this.props.month).toLocaleString('en-us', {year: '2-digit'})}
                            </Navbar.Text>
                            <Button variant="dark" size="sm" onClick={() => this.props.goToNextMonth()}>
                                {">"}
                            </Button>
                        </div>
                    }
                    <Navbar.Text>
                        <Button variant="dark" size="sm" onClick={this.props.signOut}>
                            {this.props.user.attributes.email.split("@")[0]}
                        </Button>
                    </Navbar.Text>
                </Container>
            </Navbar>
        )
    }
}

export default NavBar;