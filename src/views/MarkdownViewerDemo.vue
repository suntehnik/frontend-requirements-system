<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1>MarkdownViewer Component Demo</h1>
        <p>This page demonstrates all the features of the MarkdownViewer component.</p>
      </v-col>
    </v-row>

    <!-- Empty State Demo -->
    <v-row>
      <v-col cols="12">
        <h2>Empty State Handling (Requirement 3.10)</h2>
        <v-card>
          <v-card-title>Empty Content</v-card-title>
          <v-card-text>
            <MarkdownViewer :content="null" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Standard Markdown Demo -->
    <v-row class="mt-4">
      <v-col cols="12">
        <h2>Standard Markdown Elements (Requirement 3.1)</h2>
        <v-card>
          <v-card-title>Basic Markdown Content</v-card-title>
          <v-card-text>
            <MarkdownViewer :content="basicMarkdown" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Responsive Design Demo -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <h2>Responsive Design (Requirement 3.9)</h2>
        <v-card>
          <v-card-title>Limited Height with Scrolling</v-card-title>
          <v-card-text>
            <MarkdownViewer :content="longContent" max-height="300px" class-name="custom-viewer" />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <h2>External Links (Requirement 3.7)</h2>
        <v-card>
          <v-card-title>Links Open in New Tabs</v-card-title>
          <v-card-text>
            <MarkdownViewer :content="linksContent" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { MarkdownViewer } from '@/components/data-display'

const basicMarkdown = `# Heading 1

## Heading 2

### Heading 3

This is a paragraph with **bold text**, *italic text*, and ~~strikethrough~~.

- Unordered list item 1
- Unordered list item 2
  - Nested item
  - Another nested item

1. Ordered list item 1
2. Ordered list item 2
3. Ordered list item 3

> This is a blockquote
> 
> It can span multiple lines

---

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

- [x] Completed task
- [ ] Incomplete task
- [ ] Another incomplete task`

const longContent = `# Long Content for Scrolling Test

## Section 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## Section 2

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Section 3

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

## Section 4

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

## Section 5

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.`

const linksContent = `# Links Demo

## External Links (Open in New Tabs)

- [Vue.js Official Documentation](https://vuejs.org/)
- [Vuetify Component Library](https://vuetifyjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [GitHub Repository](https://github.com/vuejs/vue)

## Internal Links (Same Tab)

- [About Page](/about)
- [Dashboard](/dashboard)
- [Epic List](/epics)

## Email and Other Links

- [Contact Us](mailto:contact@example.com)
- [Call Us](tel:+1234567890)`
</script>

<style scoped>
.custom-viewer {
  border: 2px solid #1976d2;
  border-radius: 8px;
  padding: 16px;
}
</style>
