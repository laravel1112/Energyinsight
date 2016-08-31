library(shiny)

shinyUI(fluidPage(
  sidebarLayout(
    sidebarPanel(
      textInput("text1","text1","3")
    ),
    mainPanel(
      dataTableOutput("dt")
    )
  )
))