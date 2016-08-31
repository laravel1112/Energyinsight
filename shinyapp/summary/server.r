library(shiny)
library(highcharter)
library(httr)
library(tidyr)
library(plyr)
library(dplyr)

################# helper funcs #################
trim <- function (x) gsub("^\\s+|\\s+$", "", x)

getSeries <- function(bldg_id = 0){
  if(nchar(trim(as.character(bldg_id)))==0){
    bldg_id<-0
  }
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
  json_txt <- content(result,as="text",encoding="UTF-8",type="application/json")
  if(nchar(json_txt)>0){
    series_data <- jsonlite::fromJSON(json_txt,simplifyDataFrame=FALSE)
    if(length(series_data)>0){
      df <- data.frame(series_data[[1]]$points)
      names(df) <- series_data[[1]]$columns
      names(df)[2] <- 'kw'
      df$datetime <- as.POSIXct(df$time/1000, tz='Asia/Shanghai', origin='1970-01-01')
      return(df %>% addTimeComponents)
    }else{
      return(data.frame())
    }
  }else{
    return(data.frame())
  }
}

addTimeComponents <- function(df){
  if("datetime" %in% names(df)){
    df$date <- as.Date(df$datetime, tz='Asia/Shanghai')
    df$hour <- as.numeric(as.character(strftime(df$datetime,"%H")))
    df$month <- as.numeric(as.character(strftime(df$datetime,"%m")))
    df$year <- as.numeric(as.character(strftime(df$datetime,"%Y")))
    business_hour <- 8:18
    df$inbiz <- ifelse(df$hour %in% business_hour, "open", "closed")
    return(df)
  }else{
    return(df)
  }
}

#aggregate series data by certain factors
aggSeries<-function(df){
  #aggregate df: daily
  dfagg_daily <- ddply(df,.(date),summarize,mean_kw = round(mean(kw),2), max_kwh = max(kw), min_kwh = min(kw))
  #daily_businessornot
  dfagg_daily_inbiz <- ddply(df,.(date,inbiz),summarize,mean_kw = round(mean(kw),2), max_kw = max(kw), min_kw = min(kw))
  return(list(
    daily = dfagg_daily,
    #TODO:
    #monthly = dfagg_monthly,
    daily_inbiz = dfagg_daily_inbiz
    #daily_weekdayornot = dfagg_weekdayornot
  ))
}

getRecommendations <- function(bldg_id=3){
  df_rec <- data.frame(from=c("Jeff","Nick","Bob"),
                       message=c("Tuen off lights",
                                 "Work early, leave early",
                                 "Try not to use automatic revolving door")
                       )
  return(df_rec)
}

getAlerts <- function(bldg_id=3){
  df_alerts <- data.frame(status=c("info","danger","warning"),
                          text=c("Light usage in the night is excessive",
                                 "Heating pump is running with abnormal usage",
                                 "Server room is expericing a surge in usage")
  )
  return(df_alerts)
}

################# server #################
shinyServer(function(input, output, session){
  #each session of the page will run the data retrieval according to bldg id
  rv <- reactiveValues(CURRENT_BLDG_ID = 0)
  
  CURRENT_BLDG_ID <- 0
  df <- data.frame()
  df_rec <- data.frame()
  df_alerts <- data.frame()
  
  observe({
    rv$CURRENT_BLDG_ID <<- ifelse(!is.null(input$bldg_id),input$bldg_id,0)
    cat(paste0("current bldg id: ", rv$CURRENT_BLDG_ID))
    df <<- getSeries(rv$CURRENT_BLDG_ID)
    df_rec <<- getRecommendations(rv$CURRENT_BLDG_ID)
    df_alerts <<- getAlerts(rv$CURRENT_BLDG_ID)
  })

  filter_df_current_month<-reactive({
    throwaway<-rv$CURRENT_BLDG_ID
    if(nrow(df)>0){
      return(subset(df,month == as.integer(strftime(strptime(input$date,"%Y-%m-%d"),"%m")) &
                      year == as.integer(strftime(strptime(input$date,"%Y-%m-%d"),"%Y"))))
    }
    return(df)
  })
  
  filter_alerts<-reactive({
    throwaway<-rv$CURRENT_BLDG_ID
    #apply filter as necessary
    df_alerts
  })
  
  filter_rec<-reactive({
    throwaway<-rv$CURRENT_BLDG_ID
    #apply filter as necessary
    df_rec
  })
  
  #then render output
  output$messageMenu <- renderMenu({
    #messages are recommendations
    df_recs<-filter_rec()
    if(nrow(df_recs)>0){
      recommendations <- apply(df_recs,1,function(rec){
        messageItem(from = rec[['from']], message = rec[['message']])
      })
      dropdownMenu(type="messages", .list = recommendations)
    }
  })
  output$notificationsMenu <- renderMenu({
    #notifications are alerts
    df_alerts<-filter_alerts()
    if(nrow(df_alerts)>0){
      alerts <- apply(df_alerts,1,function(alert){
        notificationItem(text = alert[['text']], icon = icon(alert[['status']]), status = alert[['status']])
      })
      dropdownMenu(type="notifications", .list = alerts)
    }
  })
  output$daily <- renderHighchart({
    filter_df_current_date<-reactive({
      throwaway<-rv$CURRENT_BLDG_ID
      if(nrow(df)>0){
        dfdh<-subset(df,date == input$date)
        dfdh[with(dfdh, order(hour)), ]
      }else{
        data.frame()
      }
    })
    
    df<-filter_df_current_date()
    
    if(nrow(df)>0){
      highchart() %>%
        hc_title(text = paste0('kw ',input$date)) %>%
        hc_legend(enabled = FALSE) %>%
        hc_xAxis(
          categories = df$hour,
          title = list(text = "Hour")
        ) %>%
        hc_yAxis(
          title = list(text = "KW"),
          opposite = TRUE,
          #minorTickInterval = "auto",
          #minorGridLineDashStyle = "LongDashDotDot",
          showFirstLabel = FALSE,
          showLastLabel = FALSE,
          backgroundColor = list(
            linearGradient = c(0, 0, 500, 500),
            stops = list(
              list(0, 'rgb(255, 255, 255)'),
              list(1, 'rgb(200, 200, 255)')
            ))
          #plotBands = list(
          #  list(from = 25, to = 40, color = "rgba(100, 0, 0, 0.1)",
          #       label = list(text = "Confort Zone")))
        ) %>%
        hc_add_serie(name='kw',type = "spline", data=df$kw) %>%
        hc_tooltip(crosshairs = TRUE, backgroundColor = "#FCFFC5",
                 shared = TRUE, borderWidth = 2) %>% 
        hc_exporting(enabled = TRUE)
    }
  })  
  output$pie <- renderHighchart({
    col1 <- hc_get_colors()[1]
    col2 <- hc_get_colors()[4]
    col3 <- hc_get_colors()[6]
    col4 <- hc_get_colors()[8]
    col5 <- hc_get_colors()[10]
    
    highchart() %>%
      hc_title(text = 'composition') %>%
      hc_legend(enabled = TRUE) %>%
      hc_add_series(name = "Composition", type = "pie",
                    data = list(list(y = 120, name = "Lighting",
                                     sliced = TRUE, color = col1),
                                list(y = 740, name = "HVAC",
                                     color = col2,
                                     dataLabels = list(enabled = FALSE)),
                                list(y = 240, name = "Heating",
                                     color = col3,
                                     dataLabels = list(enabled = FALSE)),
                                list(y = 240, name = "Equipment",
                                     color = col4,
                                     dataLabels = list(enabled = FALSE)),
                                list(y = 240, name = "Power",
                                     color = col5,
                                     dataLabels = list(enabled = FALSE))),
                    center = c('20%', 45),
                    size = 80)
  })
  
  output$other <- renderHighchart({
    df_month<-filter_df_current_month()
    if(nrow(df_month)>0){
      lst_month_agg <- df_month[with(df_month, order(date,hour)), ] %>% aggSeries() 
      df<-lst_month_agg$daily_inbiz %>% select_("date","inbiz","mean_kw") %>% spread(inbiz,mean_kw)
    }else{
      df<-data.frame()
    }
        
    if(nrow(df)>0){
      highchart() %>%
        hc_title(text = 'kw by business open/close') %>%
        hc_xAxis(
          #type = 'date',
          categories = df$date,
          title = list(text = "date"),
          labels = list(formatter = JS("function(){return this.value.toString().slice(5);}"))
        ) %>%
        hc_yAxis(
          min = min(min(df$open),min(df$close)),
          max = max(max(df$open),max(df$close)),
          title = list(text = "kw")
        ) %>%
        hc_add_serie(name='open',type = "column", data=df$open) %>%
        hc_add_serie(name='close',type = "column", data=df$close) %>%
        hc_tooltip(crosshairs = TRUE, backgroundColor = "#FCFFC5",
                   shared = TRUE, borderWidth = 2) %>%
        hc_legend(enabled = TRUE)
    }else{
      #show no data available
    }
  })
  
  output$heatmap <- renderHighchart({
    df<-filter_df_current_month()
    if(nrow(df)>0){
      df$kw_norm <- round((df$kw - min(df$kw))/(max(df$kw) - min(df$kw)),2)
      x <- sort(unique(df$date))
      y <- sort(unique(df$hour))
      
      df<-merge(df,data.frame(date = x, dateid = seq(length(x))),all.x=TRUE)
      df<-merge(df,data.frame(hour = y, hourid = seq(length(y))),all.y=TRUE)
      df<-df[with(df, order(date,hour)), ]
      
      lst_heatmap <- df %>% 
        select_("dateid", "hourid", "kw_norm") %>% 
        list.parse2()
      colr <- list(list(0, '#2E86C1'),list(0.5, '#F8F5F5'),list(1, '#FF5733'))
      highchart() %>%
        hc_chart(type = 'heatmap') %>% 
        hc_xAxis(categories = as.character(x), 
                 title = list(text = "date"),
                 labels = list(formatter = JS("function(){return this.value.toString().slice(5);}"))
                 ) %>%
        hc_yAxis(categories = as.character(y), title = NULL) %>%
        hc_add_serie(data = lst_heatmap) %>%
        hc_legend(align = "right", layout = "vertical",
                  margin = 0, verticalAlign = "top"
                  ) %>%
        hc_colorAxis(stops= colr,min=0,max=1)
    }else{
      #show no data available 
    }
  })
}
)
#shinyApp(ui = ui, server = server)
