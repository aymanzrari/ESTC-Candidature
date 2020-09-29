import React from 'react';
import {Container, Divider, Grid, Header, List, Segment, Statistic} from "semantic-ui-react";
import ChartComp from "./ChartComp";


export default class RapportResult extends React.Component {
    render() {
    const reportResult = this.props.reportResult;
    const percentage = (nb, tot) => {
        return ((nb / tot) * 100).toFixed()+ "%";
    };
    const itemStyle = {
        padding: '15px',
    };

    let title = '';
    const descs = this.props.listDescription;
    descs.forEach((desc, i)=> {
        title += desc.key +": " + desc.value;
        if(i < descs.length - 1)
            title += ", "
    });

    const moypreinsc = Object.keys(reportResult).indexOf('moyformation') > -1 ?
        true : Object.keys(reportResult).indexOf('excel') > -1;

    const moysel = Object.keys(reportResult).indexOf('selmoyformation') > -1 ?
        true : Object.keys(reportResult).indexOf('selexcel') > -1;

    const statspreinc = Object.keys(reportResult).indexOf('typebac') > -1 ?
        true : Object.keys(reportResult).indexOf('mentionbac') > -1;

    const statsSelect = Object.keys(reportResult).indexOf('seltypebac') > -1 ?
        true : Object.keys(reportResult).indexOf('selmentionbac') > -1;

    return (
        <>
        <Container>

            <Grid style={{padding: '15px'}} stackable>
                <Grid.Row>
                    <Header as='h5' center >
                        {title}
                    </Header>
                </Grid.Row>
                <Grid.Row>
                <Grid.Column width={8}>
                    <List divided relaxed>
                        <List.Item style={itemStyle}>
                            <List.Header color='blue'>
                                {reportResult.preinscrit} Préinscrits
                            </List.Header>
                            <List.Content>
                                &nbsp; qui représent {percentage(reportResult.preinscrit, reportResult.nb_candidats)}&nbsp; des candidats totals
                            </List.Content>
                    </List.Item>
                        <List.Item style={itemStyle}>
                            <List.Header>
                                {reportResult.preselect} Candidats séléctionnés
                            </List.Header>
                            <List.Content>
                                qui représent&nbsp; {percentage(reportResult.preselect, reportResult.preinscrit)}&nbsp; des candidats préinscrits
                            </List.Content>
                        </List.Item>
                        <List.Item style={itemStyle}>
                            <List.Header>
                                {reportResult.passe_concours} passés le concours
                            </List.Header>
                            <List.Content>
                                &nbsp; qui représent&nbsp;
                            {percentage(reportResult.passe_concours, reportResult.preselect)} &nbsp;des candidats selectionnés
                            </List.Content>
                        </List.Item>
                        <List.Item style={itemStyle}>
                            <List.Header>
                                {reportResult.admis.nb_principal} des candidats dans la liste principal
                            </List.Header>
                            <List.Content>
                              &nbsp; qui représent&nbsp;
                            {percentage(reportResult.admis.nb_principal, reportResult.preselect)} &nbsp;des candidats selectionnés
                            </List.Content>
                        </List.Item>
                        <List.Item style={itemStyle}>
                            <List.Header>
                                {reportResult.admis.nb_attent} dans la liste d'attente
                            </List.Header>
                            <List.Content>
                             qui représent &nbsp;
                            {percentage(reportResult.admis.nb_attent, reportResult.preselect)} &nbsp;des candidats selectionnés
                            </List.Content>
                        </List.Item>

                    </List>
                </Grid.Column>
                <Grid.Column width={1}>
                    <Divider vertical />
                </Grid.Column>
                <Grid.Column width={7} centered>
                    <Grid>
                        <Grid.Row>
                            <Grid.Column>
                                {moypreinsc && <Header as='h4'>Préinscrits</Header>}
                                <Statistic.Group size='small' centered>
                                    { Object.keys(reportResult).indexOf('moyformation') > -1 &&
                                        <Statistic>
                                            <Statistic.Value>
                                                {
                                                    reportResult.moyformation === null ? '' :
                                                    reportResult.moyformation.toFixed(4)
                                                }
                                            </Statistic.Value>
                                            <Statistic.Label>Moyenne de formation</Statistic.Label>
                                        </Statistic>
                                    }
                                     { Object.keys(reportResult).indexOf('excel') > -1 && reportResult.excel !== undefined &&
                                            <Statistic>
                                                <Statistic.Value>
                                                    {
                                                        reportResult.excel === null ? '' :
                                                        reportResult.excel.toFixed(4)
                                                    }
                                                </Statistic.Value>
                                                <Statistic.Label>Moyenne Excel</Statistic.Label>
                                            </Statistic>
                                    }

                                </Statistic.Group>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row width={7}>
                            <Grid.Column>
                                {moysel && <Header as='h4'>Séléctionnés</Header>}
                                <Statistic.Group size='small' centered>
                                    { Object.keys(reportResult).indexOf('selmoyformation') > -1 &&
                                        <Statistic>
                                            <Statistic.Value>
                                                {
                                                    reportResult.selmoyformation === null ? '' :
                                                    reportResult.selmoyformation.toFixed(4)
                                                }
                                            </Statistic.Value>
                                            <Statistic.Label>Moyenne de formation</Statistic.Label>
                                        </Statistic>
                                    }
                                     { Object.keys(reportResult).indexOf('selexcel') > -1  &&
                                         <Statistic>
                                            <Statistic.Value>
                                                    {
                                                        reportResult.selexcel === null ? '' :
                                                        reportResult.selexcel.toFixed(4)
                                                    }
                                                </Statistic.Value>
                                            <Statistic.Label>
                                                Moyenne Excel
                                            </Statistic.Label>
                                         </Statistic>

                                    }

                                </Statistic.Group>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Grid.Column>

                </Grid.Row>
                    {statspreinc && <Header as='h2'>Préinscrits</Header>}
                    <Grid.Row columns={2}>
                            {Object.keys(reportResult).indexOf('mentionbac') > -1 &&
                            <Grid.Column >
                                <ChartComp kind='pie' legend data={{labels: reportResult.mentionbac.labels, data: reportResult.mentionbac.data}}/>
                            </Grid.Column>
                            }
                            {Object.keys(reportResult).indexOf('typebac') > -1 &&
                            <Grid.Column >
                                <ChartComp kind='horizontalBar' hideLabel
                                           data={{labels: reportResult.typebac.labels, data: reportResult.typebac.data}}/>
                            </Grid.Column>
                            }
                    </Grid.Row>


                    {statsSelect && <Header as='h2'style={{marginTop: '140px'}} >Séléctionnés</Header>}
                    <Grid.Row columns={2} >
                        {Object.keys(reportResult).indexOf('selmentionbac') > -1 &&
                            <Grid.Column >
                                <ChartComp kind='pie' legend data={{labels: reportResult.selmentionbac.labels, data: reportResult.selmentionbac.data}}/>
                            </Grid.Column>
                        }

                        {Object.keys(reportResult).indexOf('seltypebac') > -1 &&
                            <Grid.Column >
                                <ChartComp kind='horizontalBar' hideLabel
                                           data={{labels: reportResult.seltypebac.labels, data: reportResult.seltypebac.data}}/>
                            </Grid.Column>
                        }
                    </Grid.Row>
                    <Grid.Row columns={1} >
                        {Object.keys(reportResult).indexOf('moduleannee') > -1 &&
                            <Grid.Column >
                                <ChartComp kind='pie' legend randomize
                                           data={{labels: reportResult.moduleannee.labels, data: reportResult.moduleannee.data}}/>
                            </Grid.Column>
                        }
                    </Grid.Row>
                    <Grid.Row columns={1} style={{marginTop: '-10px'}}>

                        {Object.keys(reportResult).indexOf('seldiplome') > -1 &&
                        <Grid.Column width={8}>
                            <Header as='h2'>
                                Diplômes
                            </Header>
                                <Segment placeholder>
                                    <ChartComp kind='horizontalBar' randomize hideLabel
                                               data={{
                                                   labels: reportResult.seldiplome.labels,
                                                   data: reportResult.seldiplome.data
                                               }}/>
                                </Segment>
                        </Grid.Column>
                        }
                        {Object.keys(reportResult).indexOf('selmentiongl') > -1 &&
                        <Grid.Column width={8}>
                            <Header as='h2'>
                                Mention Année GLAASRI
                            </Header>
                                <Segment placeholder>
                                    <ChartComp end kind='bar'  hideLabel
                                               data={{
                                                   labels: reportResult.selmentiongl.labels,
                                                   data: reportResult.selmentiongl.data
                                               }}/>
                                </Segment>
                        </Grid.Column>
                        }
                    </Grid.Row>
            </Grid>
            </Container>

        </>
    )
        }
}
