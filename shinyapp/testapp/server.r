library(shiny)
library(jsonlite)
library(httr)

getSeries <- function(bldg_id = 3){
  cat(paste0("retrieving series for building ",bldg_id))
  #retrive data from influxdb
  url <- paste0("http://localhost:8000","/api/getseries/",bldg_id,"/")
  body <- list(
    #start_utc = 121212,
    #end_utc = 141515151,
    isExternalRequest = "False", 
    time_format = "ms",
    interval = '60m',  #hourly data
    operation = "mean"
  )
  result <- POST(url, authenticate("demouser", "demouser"), body = body, encode = "json")
  series_data <- jsonlite::fromJSON(content(result,as="text",simplifyDataFrame=FALSE))
  #df <- data.frame(series_data[[1]]$points)
  df <- data.frame(series_data$points)
  #names(df) <- series_data[[1]]$columns
  names(df) <- series_data$columns[[1]]
  names(df)[2] <- 'kw'
  df$datetime <- as.POSIXct(df$time/1000, tz='Asia/Shanghai', origin='1970-01-01')
  return(df)
}

getData<-function(size){
  cat(paste0("size is: ",nchar(as.character(size))))
  if(nchar(as.character(size))==0){
    size<-1
  }
  return(data.frame(x=rnorm(size)))
}

getData2<-function(a=3){
  #url <- "http://www.juntadeandalucia.es/export/drupaljda/ayudas.json"
  if(nchar(as.character(a))==0){
    a<-"default_text"
  }  
  url <- paste0("http://localhost:8000/api/getseries/",a,"/")
  return(data.frame(jsonlite::fromJSON(txt=url)))
}

getData3<-function(bldgid=3){
  cat(paste0("retrieving series for building ",bldgid))
  #retrive data from influxdb
  url <- paste("http://localhost:8000","/api/getseries/",bldgid,"/",sep="")
  result <- GET(url, encode = "json")
  json_txt <- content(result,as="text",encoding="UTF-8",simplifyDataFrame=FALSE)
  cat(url)
  cat("hahaha")
  cat(substring(json_txt,1,200))
  series_data <- jsonlite::fromJSON(json_txt) 
  df <- data.frame(series_data)
  return(df)
}

shinyServer(function(input,output,session){
  df<-data.frame()
  data<-reactive({
    #df<<-getData(input$text1)
    #df<<-getSeries(input$text1)
    df<<-getData3(input$text1)
    #cat(input$text1)
    df
  })
  output$dt <- renderDataTable({
    df <- data()
    df$input_txt <- input$text1
    df
  })
})