import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';

interface AIReview {
  summary: string;
  issues: Array<{
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    title: string;
    description: string;
    lineNumber?: number;
    suggestion?: string;
  }>;
  recommendations: string;
}

@Injectable()
export class AIService {
  constructor() {}

  async reviewCode(
    code: string,
    mode: 'security' | 'performance' | 'quality',
    provider: any,
  ): Promise<AIReview> {
    if (!provider) {
      throw new BadRequestException('No AI provider configured');
    }

    const prompts = {
      security: `You are a security expert. Review the following code for security vulnerabilities, unsafe patterns, and potential attacks. Focus on:
- Authentication and authorization issues
- Input validation and injection risks
- Data exposure and privacy concerns
- Cryptography and secret management
- Dependencies with known vulnerabilities

Code:
\`\`\`
${code}
\`\`\`

Respond with a JSON object containing:
{
  "summary": "Brief summary of findings",
  "issues": [
    {
      "severity": "Critical|High|Medium|Low",
      "title": "Issue title",
      "description": "Detailed description",
      "suggestion": "How to fix"
    }
  ],
  "recommendations": "General security recommendations"
}`,

      performance: `You are a performance optimization expert. Review the following code for performance issues and optimization opportunities. Focus on:
- Algorithm complexity and efficiency
- Memory usage and leaks
- Database queries and N+1 problems
- Caching opportunities
- Unnecessary computations

Code:
\`\`\`
${code}
\`\`\`

Respond with a JSON object containing:
{
  "summary": "Brief summary of findings",
  "issues": [
    {
      "severity": "Critical|High|Medium|Low",
      "title": "Issue title",
      "description": "Detailed description",
      "suggestion": "How to optimize"
    }
  ],
  "recommendations": "General performance recommendations"
}`,

      quality: `You are a code quality expert. Review the following code for quality issues and improvements. Focus on:
- Code style and consistency
- Error handling and edge cases
- Testing coverage
- Documentation and comments
- Design patterns and best practices

Code:
\`\`\`
${code}
\`\`\`

Respond with a JSON object containing:
{
  "summary": "Brief summary of findings",
  "issues": [
    {
      "severity": "Critical|High|Medium|Low",
      "title": "Issue title",
      "description": "Detailed description",
      "suggestion": "How to improve"
    }
  ],
  "recommendations": "General quality recommendations"
}`,
    };

    try {
      const response = await axios.post(
        `${provider.baseUrl}/chat/completions`,
        {
          model: provider.modelName,
          messages: [
            {
              role: 'user',
              content: prompts[mode],
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${provider.apiKey}`,
          },
          timeout: 30000,
        },
      );

      const content = response.data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI provider');
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON in response');
      }

      const review = JSON.parse(jsonMatch[0]) as AIReview;

      // Validate response structure
      if (!review.summary || !Array.isArray(review.issues)) {
        throw new Error('Invalid review structure');
      }

      return review;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `AI provider error: ${error.response?.data?.error?.message || error.message}`,
        );
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to get AI review: ${errorMessage}`);
    }
  }

  async generateDocumentation(code: string, provider: any): Promise<string> {
    if (!provider) {
      throw new BadRequestException('No AI provider configured');
    }

    const prompt = `You are a technical documentation expert. Generate comprehensive documentation for the following code. Include:
- Purpose and overview
- Key classes/functions and their responsibilities
- Input/output specifications
- Error handling
- Usage examples
- Dependencies

Code:
\`\`\`
${code}
\`\`\`

Respond with well-formatted Markdown documentation.`;

    try {
      const response = await axios.post(
        `${provider.baseUrl}/chat/completions`,
        {
          model: provider.modelName,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${provider.apiKey}`,
          },
          timeout: 30000,
        },
      );

      return response.data.choices?.[0]?.message?.content || '';
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `AI provider error: ${error.response?.data?.error?.message || error.message}`,
        );
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to generate documentation: ${errorMessage}`,
      );
    }
  }

  async analyzeArchitecture(code: string, provider: any): Promise<string> {
    if (!provider) {
      throw new BadRequestException('No AI provider configured');
    }

    const prompt = `You are a software architecture expert. Analyze the architecture of the following code. Provide:
- High-level architecture overview
- Key components and their responsibilities
- Data flow and interactions
- Design patterns used
- Suggestions for improvements

Code:
\`\`\`
${code}
\`\`\`

Respond with detailed architecture analysis in Markdown format.`;

    try {
      const response = await axios.post(
        `${provider.baseUrl}/chat/completions`,
        {
          model: provider.modelName,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${provider.apiKey}`,
          },
          timeout: 30000,
        },
      );

      return response.data.choices?.[0]?.message?.content || '';
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `AI provider error: ${error.response?.data?.error?.message || error.message}`,
        );
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Failed to analyze architecture: ${errorMessage}`,
      );
    }
  }
}
