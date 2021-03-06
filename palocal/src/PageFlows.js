import React, { Component, PureComponent } from 'react';
import axios from 'axios';
// import initialData from './initial-data';
import '@atlaskit/css-reset';
import styled from 'styled-components';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import Flow from './Flow';
import Navbar from './Navbar';

const Container = styled.div`
  // height: 90vh;
  width: 100vw;
  overflow-x: auto;
  overflow-y: hidden
  white-space: nowrap;
`;

class InnerList extends PureComponent {
  render() {
    const { userName, flows, mainFlowId, cardMap, index } = this.props;
    const mainFlow = flows[mainFlowId];
    const pdfCards = mainFlow.cardIds.map(cardId => cardMap[cardId]);

    const videoFlowId = mainFlowId + '-1';
    const videoFlow = flows[videoFlowId];
    const videoCards = videoFlow.cardIds.map(cardId => cardMap[cardId]);

    const imageFlowId = mainFlowId + '-2';
    const imageFlow = flows[imageFlowId];
    const imageCards = imageFlow.cardIds.map(cardId => cardMap[cardId]);
    return (
      <Flow
        userName={userName}
        flow={mainFlow}
        pdfCards={pdfCards}
        videoCards={videoCards}
        imageCards={imageCards}
        index={index}
        history={this.props.history}
        setDocName={this.props.setDocName}
        setPageNum={this.props.setPageNum}
        setVideoLink={this.props.setVideoLink}
        setCurrentImage={this.props.setCurrentImage}
        setPdfsList={this.props.setPdfsList}
        setVideosList={this.props.setVideosList}
        setImagesList={this.props.setImagesList}
        deleteMyself={this.props.deleteFlow}
        changeMyTitle={this.props.changeTitle}
        deleteCard={this.props.deleteCard}
        setCurrentMedia={this.props.setCurrentMedia}
      />
    );
  }
}

class PageFlows extends Component {
  constructor(props) {
    super(props);

    const formData = new FormData();
    formData.append('userName', this.props.userName);
    axios
      .post(`/getFlows`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        const data = response.data;
        var flowData = {
          cards: {},
          flows: {},
          flowOrder: []
        };
        var cardIndex = 0;
        for (var i = 0; i < data.length; i++) {
          const flowIndex = i + 1;
          flowData.flowOrder.push('flow-' + flowIndex);
          flowData.flows['flow-' + flowIndex] = {
            id: 'flow-' + flowIndex,
            title: data[i].flowName,
            cardIds: []
          };
          flowData.flows['flow-' + flowIndex + '-1'] = {
            id: 'flow-' + flowIndex + '-1',
            title: 'Video',
            cardIds: []
          };
          flowData.flows['flow-' + flowIndex + '-2'] = {
            id: 'flow-' + flowIndex + '-2',
            title: 'Image',
            cardIds: []
          };

          const pdfs = data[i].pdfs;
          for (var j = 0; j < pdfs.length; j++) {
            cardIndex++;
            flowData.cards['card-' + cardIndex] = {
              id: 'card-' + cardIndex,
              content: pdfs[j],
              type: 'pdf'
            };
            flowData.flows['flow-' + flowIndex].cardIds.push(
              'card-' + cardIndex
            );
          }

          const videos = data[i].videos;
          for (var k = 0; k < videos.length; k++) {
            cardIndex++;
            flowData.cards['card-' + cardIndex] = {
              id: 'card-' + cardIndex,
              content: videos[k],
              type: 'video'
            };
            flowData.flows['flow-' + flowIndex + '-1'].cardIds.push(
              'card-' + cardIndex
            );
          }

          const images = data[i].images;
          for (var l = 0; l < images.length; l++) {
            cardIndex++;
            flowData.cards['card-' + cardIndex] = {
              id: 'card-' + cardIndex,
              content: images[l],
              type: 'image'
            };
            flowData.flows['flow-' + flowIndex + '-2'].cardIds.push(
              'card-' + cardIndex
            );
          }
        }

        this.setState(flowData);
      })
      .catch(error => {
        console.log('Error in PageFlow constructor: ' + error);
      });
  }

  // onDragStart = () => {
  //   document.body.style.color = 'orange';
  //   document.body.style.transition = 'background-color 0.5s ease';
  // };

  // onDragUpdate = update => {
  //   const { destination } = update;
  //   const opacity = destination
  //     ? destination.index / Object.keys(this.state.cards).length
  //     : 0;
  //   document.body.style.backgroundColor = `rgba(153, 141, 217, ${opacity})`;
  // };

  onDragEnd = result => {
    // document.body.style.color = 'inherit';
    // document.body.style.backgroundColor = 'inherit';

    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'flow') {
      const newFlowOrder = Array.from(this.state.flowOrder);
      newFlowOrder.splice(source.index, 1);
      newFlowOrder.splice(destination.index, 0, draggableId);

      const newState = {
        ...this.state,
        flowOrder: newFlowOrder
      };
      this.setState(newState);
      const formData = new FormData();
      formData.append('userName', this.props.userName);
      const details = JSON.stringify(newState);
      formData.append('newState', details);
      axios
        .post(`/changeFlowOrder`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .catch(error => {
          console.log('ERROR in react changeFlowOrder post request: ' + error);
        });
      return;
    }

    const start = this.state.flows[source.droppableId];
    const finish = this.state.flows[destination.droppableId];

    if (start === finish) {
      const newCardIds = Array.from(start.cardIds);
      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);

      const newFlow = {
        ...start,
        cardIds: newCardIds
      };

      const newState = {
        ...this.state,
        flows: {
          ...this.state.flows,
          [newFlow.id]: newFlow
        }
      };

      this.setState(newState);
      const formData = new FormData();
      formData.append('userName', this.props.userName);
      const details = JSON.stringify(newState);
      formData.append('newState', details);
      axios
        .post(`/changeFlowOrder`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .catch(error => {
          console.log('ERROR in react changeFlowOrder post request: ' + error);
        });
    } else {
      // Moving from one list to another
      const startCardIds = Array.from(start.cardIds);
      startCardIds.splice(source.index, 1);
      const newStart = {
        ...start,
        cardIds: startCardIds
      };

      const finishCardIds = Array.from(finish.cardIds);
      finishCardIds.splice(destination.index, 0, draggableId);
      const newFinish = {
        ...finish,
        cardIds: finishCardIds
      };

      const newState = {
        ...this.state,
        flows: {
          ...this.state.flows,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish
        }
      };
      this.setState(newState);
      const formData = new FormData();
      formData.append('userName', this.props.userName);
      const details = JSON.stringify(newState);
      formData.append('newState', details);
      axios
        .post(`/changeFlowOrder`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .catch(error => {
          console.log('ERROR in react changeFlowOrder post request: ' + error);
        });
    }
  };

  deleteFlow = flowId => {
    const videoFlowId = flowId + '-1';
    const imageFlowId = flowId + '-2';

    var newState = JSON.parse(JSON.stringify(this.state));
    var cardsToDelete = [];

    const pdfCardsToDelete = this.state.flows[flowId].cardIds;
    for (var i = 0; i < pdfCardsToDelete.length; i++) {
      cardsToDelete.push(pdfCardsToDelete[i]);
    }

    const videoCardsToDelete = this.state.flows[videoFlowId].cardIds;
    for (var j = 0; j < videoCardsToDelete.length; j++) {
      cardsToDelete.push(videoCardsToDelete[j]);
    }

    const imageCardsToDelete = this.state.flows[imageFlowId].cardIds;
    for (var k = 0; k < imageCardsToDelete.length; k++) {
      cardsToDelete.push(imageCardsToDelete[k]);
    }

    // delete cards
    for (var l = 0; l < cardsToDelete.length; l++) {
      delete newState.cards[cardsToDelete[l]];
    }

    // delete flows
    delete newState.flows[flowId];
    delete newState.flows[videoFlowId];
    delete newState.flows[imageFlowId];

    // delete from flowOrder
    const index = newState.flowOrder.indexOf(flowId);
    newState.flowOrder.splice(index, 1);

    this.setState(newState);
  };

  changeTitle = (flowId, flowTitle) => {
    var newState = JSON.parse(JSON.stringify(this.state));
    newState.flows[flowId].title = flowTitle;
    this.setState(newState);
  };

  deleteCard = (cardId, flowIndex, cardIndex, flowId) => {
    const formData = new FormData();
    formData.append('userName', this.props.userName);
    formData.append('flowIndex', flowIndex);
    formData.append('cardIndex', cardIndex);
    formData.append('cardType', this.state.cards[cardId].type);

    axios
      .post(`/deleteCard`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        const newState = JSON.parse(JSON.stringify(this.state));

        // delete card from flow
        var newCardIds = newState.flows[flowId].cardIds;
        const index = newCardIds.indexOf(cardId);
        newCardIds.splice(index, 1);
        newState.flows[flowId].cardIds = newCardIds;

        // delete card from cards
        delete newState.cards[cardId];

        this.setState(newState);
      })
      .catch(error => {
        console.log('ERROR in react deleteCard post request: ' + error);
      });
  };

  render() {
    const isLoggedIn = this.props.userName != null;
    const stateHasLoaded = this.state !== null;
    return (
      <div>
        <Navbar
          history={this.props.history}
          userName={this.props.userName}
          profileImageUrl={this.props.profileImageUrl}
          setUserName={this.props.setUserName}
          setProfileImageUrl={this.props.setProfileImageUrl}
          setDocName={this.props.setDocName}
          setPageNum={this.props.setPageNum}
          setPdfsList={this.props.setPdfsList}
          setVideoLink={this.props.setVideoLink}
          setVideosList={this.props.setVideosList}
          setCurrentImage={this.props.setCurrentImage}
          setImagesList={this.props.setImagesList}
          setCurrentMedia={this.props.setCurrentMedia}
        />
        {isLoggedIn ? (
          <div />
        ) : (
          <h3>You have not logged in. Please go to Home to sign in.</h3>
        )}
        {stateHasLoaded ? (
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable
              droppableId="all-flows"
              direction="horizontal"
              type="flow"
            >
              {provided => (
                <Container {...provided.droppableProps} ref={provided.innerRef}>
                  {this.state.flowOrder.map((flowId, index) => {
                    return (
                      <InnerList
                        userName={this.props.userName}
                        key={flowId}
                        flows={this.state.flows}
                        mainFlowId={flowId}
                        cardMap={this.state.cards}
                        index={index}
                        history={this.props.history}
                        setDocName={this.props.setDocName}
                        setPageNum={this.props.setPageNum}
                        setVideoLink={this.props.setVideoLink}
                        setCurrentImage={this.props.setCurrentImage}
                        setPdfsList={this.props.setPdfsList}
                        setVideosList={this.props.setVideosList}
                        setImagesList={this.props.setImagesList}
                        deleteFlow={this.deleteFlow}
                        changeTitle={this.changeTitle}
                        deleteCard={this.deleteCard}
                        setCurrentMedia={this.props.setCurrentMedia}
                      />
                    );
                  })}
                  {provided.placeholder}
                </Container>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div />
        )}
      </div>
    );
  }
}

export default PageFlows;
