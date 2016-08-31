library(shiny)
library(shinydashboard)
library(highcharter)

################# ui #################
shinyUI(dashboardPage(
  #shiny dashboard
  dashboardHeader(title = "Building Summary",disable = FALSE, 
    #messages are recommendations
    dropdownMenuOutput("messageMenu"),
    #notifications are alerts
    dropdownMenuOutput("notificationsMenu")
  ),
  dashboardSidebar(disable = TRUE,
    sidebarMenu(
      menuItem("Menu1",tabName = "menu1", icon = icon("dashboard")),
      menuItem("Menu2",tabName = "menu2", icon = icon("th"), badgeLabel = "new", badgeColor = "green")
    )
  ),
  dashboardBody(
    #hidden text board to save bldg_id
    #HTML('<input type="text" id="bldg_id" name="bldg_id" style="display: none;">'), 
    tabItems(
      tabItem(tabName = "menu1",
        fluidRow(
            box(title = "Search building status of date",
                width = 3,
                status = "info",
                solidHeader = FALSE,
                collapsible = FALSE,
                dateInput('date',
                          label = 'Date input: yyyy-mm-dd',
                          value = Sys.Date()),
                textInput("bldg_id","Building ID","0")         
            ),
            box(
              width = 6,
              title = "Enery consumption of selected date",
              status = "info",
              solidHeader = FALSE,
              collapsible = FALSE,
              highchartOutput("daily",height="200px")
            ),
            box(
              width = 3,
              highchartOutput("pie",height="200px"),
              h6("Lighting has most saving opportunity")
            )
        ),
        fluidRow(
          column(width=8,
            title = "Heatmap",
            status = "primary",
            solidHeader = FALSE,
            collapsible = FALSE,
            highchartOutput("heatmap",height="250px")
          ),
          column(width=4,
            title = "open or closed",
            status = "danger",
            solidHeader = FALSE,
            collapsible = FALSE,
            highchartOutput("other",height="250px")
          )
        )
      ),#end tabItem munu1
      tabItem(tabName = "menu2",
        h2("menu2 content")
      )#end tabItem menu2
    ),#end tabItems
    # include the js code 
    includeScript("summary.js")
  )
))