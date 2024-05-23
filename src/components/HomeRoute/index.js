import {Component} from 'react'
import Cookies from 'js-cookie'
import {Link} from 'react-router-dom'
import {formatDistanceToNow} from 'date-fns'
import Loader from 'react-loader-spinner'

import {GrFormClose} from 'react-icons/gr'
import {BsSearch} from 'react-icons/bs'
import {GoPrimitiveDot} from 'react-icons/go'

import HeaderComponent from '../HeaderComponent'
import NavigationMenuAsLeftSideBar from '../NavigationMenuAsLeftSideBar'

import FailureViewComponent from '../FailureViewComponent'

import NxtWatchContext from '../../context/NxtWatchContext'

import {
  NavigationSideBarHomeComponentContainer,
  HomeComponentContainer,
  BannerContainer,
  BannerContentsContainer,
  BannerNxtWatchLogo,
  BannerText,
  GetItNowBannerButton,
  BannerCloseButton,
  HomeComponent,
  SearchInputField,
  SearchButton,
  SearchFieldContainer,
  LoaderOrFailureContainer,
  LoaderComponent,
  NoSearchResultsImage,
  NoSearchResultsText,
  TryDifferentText,
  RetryButton,
  SearchResultsContainer,
  EachVideoThumbnailContainer,
  EachVideoThumbnailImage,
  LinkContainer,
  ChannelLogoVideoTitleInformationContainer,
  ChannelLogoImage,
  VideoTitleInformationContainer,
  VideoTitle,
  VideoInformation,
  ChannelTitle,
  ChannesViewsAndUpdatedTime,
  PrimitiveDotChangingScreens,
  PrimitiveDot,
  ChannelViewAndUpdatedTimeContainer,
} from './styledComponents'

const dataFetchStatusConstants = {
  initial: 'INITIAL',
  loading: 'LOADING',
  failure: 'FAILURE',
  success: 'SUCCESS',
}

class HomeRoute extends Component {
  state = {
    showBanner: true,
    searchInput: '',
    listOfVideosDetails: [],
    dataFetchStatus: dataFetchStatusConstants.initial,
  }

  takingSearchInput = event => {
    this.setState({searchInput: event.target.value})
    console.log(event.target.value)
  }

  componentDidMount = () => {
    this.getListOfVideosData()
  }

  getListOfVideosData = async () => {
    this.setState({dataFetchStatus: dataFetchStatusConstants.loading})
    const {searchInput} = this.state
    const response = await fetch(
      `https://apis.ccbp.in/videos/all?search=${searchInput}`,
      {
        method: 'GET',
        headers: {authorization: `Bearer ${Cookies.get('jwt_token')}`},
      },
    )
    if (response.ok) {
      const data = await response.json()
      const updatedVideosData = data.videos.map(eachVideo => ({
        id: eachVideo.id,
        title: eachVideo.title,
        thumbnailUrl: eachVideo.thumbnail_url,
        channel: {
          name: eachVideo.channel.name,
          profileImageUrl: eachVideo.channel.profile_image_url,
        },
        viewCount: eachVideo.view_count,
        publishedAt: eachVideo.published_at,
      }))
      this.setState({dataFetchStatus: dataFetchStatusConstants.success})
      this.setState({listOfVideosDetails: updatedVideosData})
      console.log(updatedVideosData)
    }
    if (!response.ok) {
      this.setState({dataFetchStatus: dataFetchStatusConstants.failure})
    }
  }

  closeBanner = () => {
    this.setState({showBanner: false})
  }

  renderHomePartOnDataResponse = lightTheme => {
    const {dataFetchStatus, listOfVideosDetails} = this.state

    switch (dataFetchStatus) {
      case dataFetchStatusConstants.loading:
        return (
          <LoaderOrFailureContainer data-testid="loader" value={lightTheme}>
            <LoaderComponent
              as={Loader}
              type="ThreeDots"
              color="#4f46e5"
              height="50"
              width="50"
            />
          </LoaderOrFailureContainer>
        )
      case dataFetchStatusConstants.failure:
        return (
          <LoaderOrFailureContainer value={lightTheme}>
            <FailureViewComponent retryFunction={this.getListOfVideosData} />
          </LoaderOrFailureContainer>
        )
      case dataFetchStatusConstants.success:
        return (
          <>
            {listOfVideosDetails.length === 0 ? (
              <LoaderOrFailureContainer>
                <NoSearchResultsImage
                  src="https://assets.ccbp.in/frontend/react-js/nxt-watch-no-search-results-img.png"
                  alt="no videos"
                />
                <NoSearchResultsText value={lightTheme}>
                  No Search Results Found
                </NoSearchResultsText>
                <TryDifferentText>
                  Try different key words or remove search filter
                </TryDifferentText>
                <RetryButton type="button" onClick={this.getListOfVideosData}>
                  Retry
                </RetryButton>
              </LoaderOrFailureContainer>
            ) : (
              <SearchResultsContainer>
                {listOfVideosDetails.map(each => {
                  const {channel} = each

                  return (
                    <EachVideoThumbnailContainer key={each.id}>
                      <LinkContainer as={Link} to={`/videos/${each.id}`}>
                        <EachVideoThumbnailImage
                          src={each.thumbnailUrl}
                          alt="video thumbnail"
                        />
                        <ChannelLogoVideoTitleInformationContainer>
                          <ChannelLogoImage
                            src={channel.profileImageUrl}
                            alt="channel logo"
                          />
                          <VideoTitleInformationContainer>
                            <VideoTitle value={lightTheme}>
                              {each.title}
                            </VideoTitle>
                            <VideoInformation>
                              <ChannelTitle>{channel.name}</ChannelTitle>
                              <ChannelViewAndUpdatedTimeContainer>
                                <PrimitiveDotChangingScreens
                                  as={GoPrimitiveDot}
                                />
                                <ChannesViewsAndUpdatedTime>
                                  {each.viewCount} views
                                </ChannesViewsAndUpdatedTime>
                                <PrimitiveDot as={GoPrimitiveDot} />
                                <ChannesViewsAndUpdatedTime>
                                  {formatDistanceToNow(
                                    new Date(each.publishedAt),
                                    {
                                      addSuffix: true,
                                    },
                                  )
                                    .split(' ')
                                    .reverse()
                                    .slice(0, 3)
                                    .reverse()
                                    .join(' ')}
                                </ChannesViewsAndUpdatedTime>
                              </ChannelViewAndUpdatedTimeContainer>
                            </VideoInformation>
                          </VideoTitleInformationContainer>
                        </ChannelLogoVideoTitleInformationContainer>
                      </LinkContainer>
                    </EachVideoThumbnailContainer>
                  )
                })}
              </SearchResultsContainer>
            )}
          </>
        )
      default:
        return null
    }
  }

  render() {
    const {showBanner} = this.state

    return (
      <div>
        <HeaderComponent />
        <NavigationSideBarHomeComponentContainer>
          <NavigationMenuAsLeftSideBar />
          <NxtWatchContext.Consumer>
            {value => {
              const {lightTheme} = value
              return (
                <HomeComponentContainer>
                  {showBanner && (
                    <BannerContainer data-testid="banner">
                      <BannerContentsContainer>
                        <BannerNxtWatchLogo
                          src="https://assets.ccbp.in/frontend/react-js/nxt-watch-logo-light-theme-img.png"
                          alt="nxt watch logo"
                        />
                        <BannerText>
                          Buy Nxt Watch Premium prepaid plans with UPI
                        </BannerText>
                        <GetItNowBannerButton type="button">
                          GET IT NOW
                        </GetItNowBannerButton>
                      </BannerContentsContainer>
                      <div>
                        <BannerCloseButton
                          type="button"
                          data-testid="close"
                          onClick={this.closeBanner}
                        >
                          <GrFormClose />
                        </BannerCloseButton>
                      </div>
                    </BannerContainer>
                  )}
                  <HomeComponent data-testid="home" value={lightTheme}>
                    <SearchFieldContainer value={lightTheme}>
                      <SearchInputField
                        type="search"
                        placeholder="Search..."
                        onChange={this.takingSearchInput}
                        valuee={lightTheme}
                      />
                      <SearchButton
                        type="button"
                        data-testid="searchButton"
                        onClick={this.getListOfVideosData}
                        value={lightTheme}
                      >
                        <BsSearch />
                      </SearchButton>
                    </SearchFieldContainer>
                    <>{this.renderHomePartOnDataResponse(lightTheme)}</>
                  </HomeComponent>
                </HomeComponentContainer>
              )
            }}
          </NxtWatchContext.Consumer>
        </NavigationSideBarHomeComponentContainer>
      </div>
    )
  }
}

export default HomeRoute
